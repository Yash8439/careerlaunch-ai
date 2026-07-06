import express from 'express'
import multer from 'multer'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'

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
      return file.buffer.toString('utf-8')
    }
  }
  if (file.mimetype.includes('wordprocessingml')) {
    const mammoth = await import('mammoth')
    const result = await mammoth.default.extractRawText({ buffer: file.buffer })
    return result.value
  }
  return file.buffer.toString('utf-8')
}

router.post('/generate', protect, upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, jobTitle, companyName, tone } = req.body

    if (!jobDescription) return res.status(400).json({ message: 'Job description is required' })

    let resumeContext = ''
    if (req.file) {
      resumeContext = await extractText(req.file)
    }

    const prompt = `You are an expert career counselor and professional cover letter writer.

${resumeContext ? `Candidate's Resume:\n${resumeContext.slice(0, 2000)}` : 'No resume provided — write a general cover letter.'}

Job Details:
- Position: ${jobTitle || 'Software Developer'}
- Company: ${companyName || 'the company'}
- Job Description: ${jobDescription.slice(0, 1500)}
- Tone: ${tone || 'Professional'}

Write a compelling, personalized cover letter that:
1. Opens with a strong hook (not "I am writing to apply...")
2. Highlights relevant skills from the resume that match the job description
3. Shows genuine interest in the company/role
4. Includes specific achievements or projects if available
5. Closes with a confident call to action
6. Is 3-4 paragraphs, 250-350 words
7. Tone should be ${tone || 'professional'} but human — not robotic

Return ONLY the cover letter text, no subject line, no "Dear Hiring Manager" heading — just the body paragraphs starting from the opening hook.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert cover letter writer. Write compelling, personalized cover letters. Return only the letter body text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const coverLetter = completion.choices[0]?.message?.content?.trim()
    res.json({ success: true, coverLetter, jobTitle, companyName })
  } catch (err) {
    console.error('Cover letter error:', err)
    res.status(500).json({ message: 'Failed to generate cover letter', error: err.message })
  }
})

export default router