import express from 'express'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/generate', protect, async (req, res) => {
  try {
    const { year, targetRole, currentSkills, weeklyHours, goal } = req.body

    if (!targetRole) return res.status(400).json({ message: 'Target role is required' })

    const prompt = `You are an expert career mentor for engineering students preparing for tech placements.

Student Profile:
- Year: ${year || 'Not specified'}
- Target Role: ${targetRole}
- Current Skills: ${currentSkills || 'Beginner'}
- Weekly Study Hours Available: ${weeklyHours || 10}
- Goal: ${goal || `Get placed as ${targetRole}`}

Create a detailed week-by-week roadmap (8 weeks) to prepare this student for placements.

Return ONLY valid JSON, no markdown, no backticks:
{
  "roleOverview": "<2 sentence overview of this role and what companies look for>",
  "totalWeeks": 8,
  "weeks": [
    {
      "weekNumber": 1,
      "title": "<short week title>",
      "focus": "<main focus area>",
      "topics": ["topic1", "topic2", "topic3"],
      "tasks": ["task1", "task2", "task3", "task4"],
      "project": "<project idea for this week or null>",
      "resources": ["resource1", "resource2"]
    }
  ],
  "skillsToLearn": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "projectsToB": ["project1", "project2", "project3"],
  "interviewPrepTips": ["tip1", "tip2", "tip3"],
  "estimatedReadiness": "<percentage like 75%>"
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert career mentor. Return only valid JSON, structured and detailed.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 3000,
    })

    const text = completion.choices[0]?.message?.content?.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const roadmap = JSON.parse(jsonMatch[0])

    res.json({ success: true, roadmap })
  } catch (err) {
    console.error('Roadmap error:', err)
    res.status(500).json({ message: 'Failed to generate roadmap', error: err.message })
  }
})

export default router