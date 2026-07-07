import express from 'express'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/generate', protect, async (req, res) => {
  try {
    const { companyName } = req.body
    if (!companyName) return res.status(400).json({ message: 'Company name required' })

    const prompt = `You are an expert interview coach with deep knowledge of ${companyName}'s hiring process.

Generate a comprehensive interview preparation guide for ${companyName}.

Return ONLY valid JSON, no markdown, no backticks:
{
  "tagline": "<one line about company's engineering culture>",
  "difficulty": "<Easy/Medium/Hard/Very Hard>",
  "overview": "<2-3 sentences about what ${companyName} looks for in candidates>",
  "rounds": [
    { "name": "<round name>", "description": "<what happens in this round>" }
  ],
  "focusAreas": ["area1", "area2", "area3", "area4", "area5"],
  "dsaNote": "<one sentence about ${companyName}'s DSA style>",
  "dsaTopics": [
    {
      "topic": "<topic name>",
      "priority": "<Must Know/Important/Good to Have>",
      "subtopics": ["subtopic1", "subtopic2", "subtopic3"]
    }
  ],
  "hrNote": "<one sentence about ${companyName}'s HR round style>",
  "hrQuestions": [
    {
      "question": "<HR question>",
      "hint": "<brief tip on how to answer for ${companyName} specifically>"
    }
  ],
  "tips": [
    {
      "emoji": "<relevant emoji>",
      "title": "<tip title>",
      "description": "<2-3 sentence tip specific to ${companyName}>"
    }
  ]
}

Make it specific to ${companyName} — not generic advice. Include at least 4 rounds, 6 DSA topics, 8 HR questions, and 5 tips.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert interview coach. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 2500,
    })

    const text = completion.choices[0]?.message?.content?.trim()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const prepData = JSON.parse(jsonMatch[0])

    res.json({ success: true, prepData, companyName })
  } catch (err) {
    console.error('Company prep error:', err)
    res.status(500).json({ message: 'Failed to generate prep data', error: err.message })
  }
})

export default router