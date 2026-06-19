import express from 'express'
import multer from 'multer'
import mammoth from 'mammoth'
import Groq from 'groq-sdk'
import { protect } from '../middleware/auth.middleware.js'
// Custom text splitter — no LangChain needed
const splitText = (text, chunkSize = 800, overlap = 100) => {
  const chunks = []
  let start = 0
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    start += chunkSize - overlap
  }
  return chunks
}

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// In-memory store (per session)
const documentStore = new Map()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ]
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
    const result = await mammoth.extractRawText({ buffer: file.buffer })
    return result.value
  }
  return file.buffer.toString('utf-8')
}

// Simple similarity search using keyword matching
const findRelevantChunks = (chunks, query, topK = 5) => {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  
  const scored = chunks.map((chunk, idx) => {
    const chunkLower = chunk.toLowerCase()
    let score = 0
    queryWords.forEach(word => {
      const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length
      score += matches
    })
    return { chunk, score, idx }
  })

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk)
}

// Upload & process document
router.post('/upload', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })

    const text = await extractText(req.file)
    if (!text || text.trim().length < 50)
      return res.status(400).json({ message: 'Could not extract text' })

    const chunks = splitText(text, 800, 100)

    const userId = req.user.id

    if (!documentStore.has(userId)) {
      documentStore.set(userId, { chunks: [], files: [] })
    }

    const userStore = documentStore.get(userId)
    userStore.chunks.push(...chunks)
    userStore.files.push({
      name: req.file.originalname,
      size: req.file.size,
      chunks: chunks.length,
      uploadedAt: new Date()
    })

    console.log(`Uploaded: ${req.file.originalname}, Chunks: ${chunks.length}`)

    res.json({
      success: true,
      message: `Document processed! ${chunks.length} chunks created.`,
      fileName: req.file.originalname,
      totalChunks: userStore.chunks.length,
      files: userStore.files
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ message: 'Upload failed', error: err.message })
  }
})

// Chat with documents
router.post('/message', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body
    const userId = req.user.id

    if (!message) return res.status(400).json({ message: 'Message required' })

    const userStore = documentStore.get(userId)

    let systemPrompt = ''
    let relevantChunks = []

    if (!userStore || userStore.chunks.length === 0) {
      systemPrompt = `You are CareerLaunch AI, a helpful placement preparation assistant.
Help students with DSA, OS, DBMS, OOPS, System Design, and interview preparation.
Be concise, clear and give examples when needed.
IMPORTANT: Always reply in the same language the user is using. If user writes in Hindi, reply in Hindi. If user writes in English, reply in English. If user writes in Hinglish, reply in Hinglish.`
    } else {
      relevantChunks = findRelevantChunks(userStore.chunks, message)
      const context = relevantChunks.join('\n\n---\n\n')

      systemPrompt = `You are CareerLaunch AI, an intelligent study assistant.

Answer the user's question based on the provided document context.
If the answer is in the context, use it. If not, use your general knowledge but mention it.
Be concise, structured, and use bullet points when listing items.
IMPORTANT: Always reply in the same language the user is using. If user writes in Hindi, reply in Hindi. If user writes in English, reply in English. If user writes in Hinglish, reply in Hinglish.

Document Context:
${context.slice(0, 3000)}`
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ]

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.5,
      max_tokens: 1024,
    })

    const reply = completion.choices[0]?.message?.content || 'Sorry, could not generate response.'

    res.json({
      success: true,
      reply,
      sources: relevantChunks.length > 0 ? userStore.files.map(f => f.name) : [],
      hasDocuments: userStore?.chunks?.length > 0
    })
  } catch (err) {
    console.error('Chat error:', err)
    res.status(500).json({ message: 'Chat failed', error: err.message })
  }
})

// Get uploaded files
router.get('/files', protect, async (req, res) => {
  try {
    const userId = req.user.id
    const userStore = documentStore.get(userId)
    res.json({
      files: userStore?.files || [],
      totalChunks: userStore?.chunks?.length || 0
    })
  } catch (err) {
    res.status(500).json({ message: 'Error fetching files' })
  }
})

// Clear documents
router.delete('/clear', protect, async (req, res) => {
  try {
    documentStore.delete(req.user.id)
    res.json({ success: true, message: 'All documents cleared' })
  } catch (err) {
    res.status(500).json({ message: 'Error clearing documents' })
  }
})

export default router