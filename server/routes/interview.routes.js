import express from 'express'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'
import User from '../models/User.model.js'

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Generate interview questions
router.post('/generate', protect, async (req, res) => {
  try {
    const { role, difficulty, topics } = req.body

    const prompt = `You are an expert technical interviewer at a top tech company.
Generate exactly 8 interview questions for a ${difficulty} level ${role} position.
${topics ? `Focus on these topics: ${topics}` : ''}

Return ONLY a valid JSON array, no markdown, no backticks:
[
  {
    "id": 1,
    "question": "question text here",
    "topic": "DSA/OS/DBMS/OOPS/System Design/React/Node/etc",
    "difficulty": "${difficulty}",
    "expectedPoints": ["point1", "point2", "point3"]
  }
]`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a technical interviewer. Return only valid JSON arrays.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const text = completion.choices[0]?.message?.content?.trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON found')
    const questions = JSON.parse(jsonMatch[0])

    res.json({ success: true, questions })
  } catch (err) {
    console.error('Generate error:', err)
    res.status(500).json({ message: 'Failed to generate questions', error: err.message })
  }
})

// Evaluate answer
router.post('/evaluate', protect, async (req, res) => {
  try {
    const { question, answer, expectedPoints, role, difficulty } = req.body

    if (!answer || answer.trim().length < 5) {
      return res.json({
        score: 0,
        feedback: 'No answer provided.',
        technicalAccuracy: 0,
        completeness: 0,
        improvements: ['Please provide a detailed answer']
      })
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question}
Expected Key Points: ${expectedPoints?.join(', ')}
Candidate's Answer: ${answer}
Role: ${role}, Difficulty: ${difficulty}

Evaluate and return ONLY valid JSON, no markdown:
{
  "score": <0-100>,
  "technicalAccuracy": <0-100>,
  "completeness": <0-100>,
  "feedback": "<2-3 sentence constructive feedback>",
  "improvements": ["improvement1", "improvement2"],
  "missedPoints": ["missed1", "missed2"],
  "goodPoints": ["good1", "good2"]
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a technical interviewer. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    const text = completion.choices[0]?.message?.content?.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const evaluation = JSON.parse(jsonMatch[0])

    res.json({ success: true, ...evaluation })
  } catch (err) {
    console.error('Evaluate error:', err)
    res.status(500).json({ message: 'Evaluation failed', error: err.message })
  }
})

// Generate final report
router.post('/report', protect, async (req, res) => {
  try {
    const { answers, role, difficulty } = req.body

    const totalScore = Math.round(answers.reduce((sum, a) => sum + (a.score || 0), 0) / answers.length)
    const avgTechnical = Math.round(answers.reduce((sum, a) => sum + (a.technicalAccuracy || 0), 0) / answers.length)

    const weakTopics = answers
      .filter(a => a.score < 60)
      .map(a => a.topic)
      .filter((v, i, arr) => arr.indexOf(v) === i)

    const strongTopics = answers
      .filter(a => a.score >= 75)
      .map(a => a.topic)
      .filter((v, i, arr) => arr.indexOf(v) === i)

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { interviewsCompleted: 1 }
    })

     const user = await User.findById(req.user.id)
    const topicToSkillMap = {
      'DSA': 'DSA', 'Data Structures': 'DSA', 'Algorithms': 'DSA',
      'OS': 'OS', 'Operating Systems': 'OS',
      'DBMS': 'DBMS', 'SQL': 'DBMS', 'Database': 'DBMS',
      'OOPS': 'OOPS', 'OOP': 'OOPS',
      'React': 'WebDev', 'Node': 'WebDev', 'JavaScript': 'WebDev', 'Frontend': 'WebDev', 'Backend': 'WebDev', 'System Design': 'WebDev'
    }

    answers.forEach(a => {
      const matchedSkill = Object.keys(topicToSkillMap).find(key =>
        a.topic?.toLowerCase().includes(key.toLowerCase())
      )
      const skillKey = matchedSkill ? topicToSkillMap[matchedSkill] : 'WebDev'
      const increment = a.score >= 75 ? 8 : a.score >= 50 ? 5 : 2
      const current = user.skillProgress[skillKey] || 0
      user.skillProgress[skillKey] = Math.min(100, current + increment)
    })
    await user.save()
const Activity = (await import('../models/Activity.model.js')).default
await Activity.create({
  user: req.user.id,
  type: 'mock_interview',
  details: { role, difficulty, grade: totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : 'D' },
  score: totalScore
})

    res.json({
      success: true,
      totalScore,
      avgTechnical,
      weakTopics,
      strongTopics,
      totalQuestions: answers.length,
      passed: totalScore >= 60,
      grade: totalScore >= 85 ? 'A' : totalScore >= 70 ? 'B' : totalScore >= 60 ? 'C' : 'D'
    })
  } catch (err) {
    res.status(500).json({ message: 'Report failed', error: err.message })
  }
})

export default router