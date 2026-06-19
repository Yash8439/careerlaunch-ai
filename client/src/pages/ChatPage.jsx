import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Upload, Send, Brain, FileText,
  Trash2, BookOpen, X, ChevronDown, Mic, MicOff
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map(i => (
      <motion.div key={i} className="w-2 h-2 bg-primary-400 rounded-full"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
    ))}
  </div>
)

const MessageBubble = ({ msg }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
    {msg.role === 'assistant' && (
      <div className="w-8 h-8 bg-primary-900/50 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-1">
        <Brain size={16} className="text-primary-400" />
      </div>
    )}
    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed
      ${msg.role === 'user'
        ? 'bg-primary-600 text-white rounded-tr-sm'
        : 'bg-dark-700 text-gray-200 rounded-tl-sm border border-white/5'
      }`}>
      {msg.content.split('\n').map((line, i) => (
        <p key={i} className={line.startsWith('•') || line.startsWith('-') ? 'ml-2' : ''}>
          {line || <br />}
        </p>
      ))}
      {msg.sources && msg.sources.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <BookOpen size={10} /> Source: {msg.sources.join(', ')}
          </p>
        </div>
      )}
    </div>
    {msg.role === 'user' && (
      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center ml-2 flex-shrink-0 mt-1">
        <span className="text-xs font-bold text-white">U</span>
      </div>
    )}
  </motion.div>
)

const suggestedQuestions = [
  "What is Deadlock and how to prevent it?",
  "Explain Binary Search Tree",
  "What is normalization in DBMS?",
  "Explain OOPS concepts",
  "What is time complexity of Quick Sort?",
]

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am CareerLaunch AI. Upload your study notes and ask me anything! I can also answer general placement questions without documents.',
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [showUpload, setShowUpload] = useState(false)
  const [dragging, setDragging] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
const recognitionRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/chat/files', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setFiles(data.files || [])
    } catch { }
  }
  const startVoice = () => {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return toast.error('Voice input not supported in this browser')
  }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  recognitionRef.current = new SR()
  recognitionRef.current.continuous = false
  recognitionRef.current.interimResults = true
  recognitionRef.current.lang = 'en-IN'

  recognitionRef.current.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
    setInput(transcript)
  }

  recognitionRef.current.onend = () => {
    setListening(false)
  }

  recognitionRef.current.onerror = () => {
    setListening(false)
    toast.error('Voice recognition error, try again')
  }

  recognitionRef.current.start()
  setListening(true)
}

const stopVoice = () => {
  recognitionRef.current?.stop()
  setListening(false)
}

  const uploadFile = async (file) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('document', file)
      const { data } = await axios.post('http://localhost:5000/api/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      })
      toast.success(`${file.name} uploaded! ${data.totalChunks} chunks ready.`)
      setFiles(data.files)
      setShowUpload(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ I have processed "${file.name}" successfully! You can now ask me questions from this document.`
      }])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files[0] || e.target.files[0]
    if (file) uploadFile(file)
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const { data } = await axios.post('http://localhost:5000/api/chat/message',
        { message: msg, history },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        sources: data.sources
      }])
    } catch (err) {
      toast.error('Failed to get response')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const clearDocs = async () => {
    try {
      await axios.delete('http://localhost:5000/api/chat/clear', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setFiles([])
      toast.success('Documents cleared!')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'All documents have been cleared. Upload new notes to continue!'
      }])
    } catch { toast.error('Failed to clear') }
  }

 return (
  <div className="min-h-screen bg-dark-900 text-white flex flex-col relative">
    <AnimatedBackground />

    {/* Header */}
    <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between flex-shrink-0 relative z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Brain size={20} className="text-primary-400" /> AI Notes Chatbot
            </h1>
            <p className="text-xs text-gray-400">
              {files.length > 0 ? `${files.length} document(s) loaded` : 'No documents — general AI mode'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {files.length > 0 && (
            <button onClick={clearDocs}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-900/50 px-3 py-1.5 rounded-lg transition-colors">
              <Trash2 size={14} /> Clear Docs
            </button>
          )}
          <button onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-400 text-white px-4 py-2 rounded-lg text-sm transition-all">
            <Upload size={16} /> Upload Notes
          </button>
        </div>
      </div>

      {/* Upload Panel */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-dark-800 border-b border-white/5 overflow-hidden">
            <div className="px-6 py-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                  ${dragging ? 'border-primary-400 bg-primary-900/20' : 'border-white/10 hover:border-primary-600/50'}`}>
                <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileDrop} />
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-400">Processing document...</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={32} className="text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-300 font-medium">Drop your notes here</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT supported</p>
                  </div>
                )}
              </div>

              {files.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 bg-dark-700 rounded-lg px-3 py-1.5 text-xs">
                      <FileText size={12} className="text-primary-400" />
                      <span className="text-gray-300">{f.name}</span>
                      <span className="text-gray-500">{f.chunks} chunks</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="w-8 h-8 bg-primary-900/50 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                <Brain size={16} className="text-primary-400" />
              </div>
              <div className="bg-dark-700 rounded-2xl rounded-tl-sm border border-white/5">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="text-xs bg-dark-700 hover:bg-dark-600 border border-white/5 text-gray-300 px-3 py-1.5 rounded-full transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
<div className="bg-dark-800 border-t border-white/5 px-6 py-4 flex-shrink-0 relative z-10">
  <div className="max-w-3xl mx-auto flex gap-3">
    <input
      value={input}
      onChange={e => setInput(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
      placeholder={listening ? "Listening..." : files.length > 0 ? "Ask from your uploaded notes..." : "Ask any placement question..."}
      className={`flex-1 bg-dark-700 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-colors text-sm
        ${listening ? 'border-red-400 animate-pulse' : 'border-white/10 focus:border-primary-400'}`}
    />
    <button onClick={listening ? stopVoice : startVoice}
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0
        ${listening ? 'bg-red-500 hover:bg-red-400' : 'bg-dark-700 border border-white/10 hover:border-primary-400 text-gray-400 hover:text-primary-400'}`}>
      {listening ? <MicOff size={18} className="text-white" /> : <Mic size={18} />}
    </button>
    <button onClick={() => sendMessage()}
      disabled={!input.trim() || loading}
      className="w-12 h-12 bg-primary-600 hover:bg-primary-400 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all flex-shrink-0">
      <Send size={18} className="text-white" />
    </button>
  </div>
</div>


    </div>
  )
}