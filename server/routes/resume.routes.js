import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'
import User from '../models/User.model.js'


const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only PDF, DOCX, TXT allowed'))
  }
})

const extractText = async (file) => {
  if (file.mimetype === 'application/pdf') {
    try {
      const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs')
      const pdf = await getDocument({ data: new Uint8Array(file.buffer) }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(' ') + '\n'
      }
      return text
    } catch (e) {
      console.log('PDF extract error:', e.message)
      return file.buffer.toString('utf-8')
    }
  }
  if (file.mimetype.includes('wordprocessingml')) {
    const result = await mammoth.extractRawText({ buffer: file.buffer })
    return result.value
  }
  return file.buffer.toString('utf-8')
}

router.post('/analyze', protect, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
      const resumeText = await extractText(req.file)
    console.log('Extracted text length:', resumeText.length)        // ← yahan
    console.log('First 200 chars:', resumeText.slice(0, 200))
    if (!resumeText || resumeText.trim().length < 50)
      return res.status(400).json({ message: 'Could not extract text from resume' })

    const prompt = `You are an expert ATS resume analyzer and career coach. Analyze this resume and return ONLY a valid JSON object with no markdown, no backticks, no extra text whatsoever.

Resume Text:
${resumeText.slice(0, 3000)}

Return ONLY this exact JSON structure, nothing else:
{
  "atsScore": <number 0-100>,
  "overallRating": "<Excellent/Good/Average/Poor>",
  "technicalSkills": ["skill1", "skill2"],
  "softSkills": ["skill1", "skill2"],
  "missingTechnicalSkills": ["skill1", "skill2"],
  "missingSoftSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4"],
  "projectAnalysis": "<2-3 sentence analysis of projects>",
  "experienceLevel": "<Fresher/Junior/Mid/Senior>",
  "topKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "sectionScores": {
    "education": <number 0-100>,
    "experience": <number 0-100>,
    "skills": <number 0-100>,
    "projects": <number 0-100>,
    "formatting": <number 0-100>
  }
}`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an expert ATS resume analyzer. Always respond with valid JSON only. No markdown, no backticks, no explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const text = completion.choices[0]?.message?.content?.trim()

// Better JSON extraction
const jsonMatch = text.match(/\{[\s\S]*\}/)
if (!jsonMatch) throw new Error('No JSON found in response')
const cleaned = jsonMatch[0]
const analysis = JSON.parse(cleaned)

    await User.findByIdAndUpdate(req.user.id, { resumeScore: analysis.atsScore })
    const Activity = (await import('../models/Activity.model.js')).default
await Activity.create({
  user: req.user.id,
  type: 'resume_analysis',
  details: { fileName: req.file.originalname, rating: analysis.overallRating },
  score: analysis.atsScore
})

    res.json({ success: true, analysis, fileName: req.file.originalname })
  } catch (err) {
    console.error('Resume analyze error:', err)
    res.status(500).json({ message: 'Analysis failed', error: err.message })
  }
})

export default router