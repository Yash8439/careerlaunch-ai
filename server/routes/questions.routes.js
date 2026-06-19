import express from 'express'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/generate', protect, async (req, res) => {
  try {
    const { topic, count, difficulty, company } = req.body

    if (!topic) return res.status(400).json({ message: 'Topic is required' })

    const prompt = `Generate exactly ${count || 10} interview questions on the topic: ${topic}.
Difficulty level: ${difficulty || 'Intermediate'}.
${company ? `Style these questions as if asked at ${company} interviews.` : ''}

Return ONLY a valid JSON array, no markdown:
[
  {
    "id": 1,
    "question": "question text",
    "category": "${topic}",
    "difficulty": "${difficulty || 'Intermediate'}",
    "answer": "<concise model answer, 2-4 sentences>"
  }
]`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert interview question generator. Return only valid JSON arrays with accurate technical answers.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 3000,
    })

    const text = completion.choices[0]?.message?.content?.trim()
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON found')
    const questions = JSON.parse(jsonMatch[0])

    res.json({ success: true, questions })
  } catch (err) {
    console.error('Questions error:', err)
    res.status(500).json({ message: 'Failed to generate questions', error: err.message })
  }
})

export default router