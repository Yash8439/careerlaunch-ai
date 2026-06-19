import express from 'express'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'
import User from '../models/User.model.js'
import Activity from '../models/Activity.model.js'

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.get('/daily-advice', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const recentActivity = await Activity.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(15)

    const interviewActivities = recentActivity.filter(a => a.type === 'mock_interview')
    const avgInterviewScore = interviewActivities.length > 0
      ? Math.round(interviewActivities.reduce((s, a) => s + (a.score || 0), 0) / interviewActivities.length)
      : null

    const weakestSkill = Object.entries(user.skillProgress || {})
      .sort((a, b) => a[1] - b[1])[0]
    const strongestSkill = Object.entries(user.skillProgress || {})
      .sort((a, b) => b[1] - a[1])[0]

    const prompt = `You are an expert placement coach AI giving personalized daily advice to a student.

Student Data:
- Resume Score: ${user.resumeScore || 'Not analyzed yet'}/100
- Mock Interviews Completed: ${user.interviewsCompleted || 0}
- Average Interview Score (recent): ${avgInterviewScore !== null ? avgInterviewScore + '%' : 'No interviews yet'}
- Study Streak: ${user.studyStreak || 0} days
- Skill Progress: ${JSON.stringify(user.skillProgress || {})}
- Weakest Skill: ${weakestSkill ? `${weakestSkill[0]} (${weakestSkill[1]}%)` : 'Unknown'}
- Strongest Skill: ${strongestSkill ? `${strongestSkill[0]} (${strongestSkill[1]}%)` : 'Unknown'}
- Recent Activities Count: ${recentActivity.length}

Generate short, punchy, motivating daily advice for this student's placement preparation.
Be specific to their actual data — mention real numbers/skills, not generic advice.

Return ONLY valid JSON, no markdown:
{
  "headline": "<one short punchy headline, max 8 words>",
  "insights": ["insight1 — specific observation about their data", "insight2", "insight3"],
  "actionItem": "<one specific actionable task for today>",
  "mood": "<encouraging/warning/celebratory — based on their progress>",
  "priorityArea": "<the skill/area they should focus on today>"
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a sharp, encouraging placement coach. Always return valid JSON. Be specific and data-driven, never generic.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 600,
    })

    const text = completion.choices[0]?.message?.content?.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const advice = JSON.parse(jsonMatch[0])

    res.json({ success: true, advice })
  } catch (err) {
    console.error('Coach advice error:', err)
    res.status(500).json({ message: 'Failed to generate advice', error: err.message })
  }
})

export default router