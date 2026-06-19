import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, ListChecks, Sparkles, Download, ChevronDown, ChevronUp } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
import { API_URL } from '../config'

const topics = [
  'DSA', 'Operating Systems', 'DBMS', 'OOPS', 'System Design',
  'React.js', 'Node.js', 'JavaScript', 'SQL', 'Computer Networks'
]

const difficulties = ['Beginner', 'Intermediate', 'Advanced']

export default function QuestionGenerator() {
  const [topic, setTopic] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [difficulty, setDifficulty] = useState('Intermediate')
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [openIdx, setOpenIdx] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const generate = async () => {
    const finalTopic = customTopic || topic
    if (!finalTopic) return toast.error('Please select or enter a topic')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/api/questions/generate`,
        { topic: finalTopic, difficulty, count },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setQuestions(data.questions)
      toast.success(`${data.questions.length} questions generated!`)
    } catch (err) {
      toast.error('Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  const downloadAsText = () => {
    const finalTopic = customTopic || topic
    const content = questions.map((q, i) => `${i + 1}. ${q.question}\n\nAnswer: ${q.answer}\n`).join('\n---\n\n')
    const blob = new Blob([`${finalTopic} Interview Questions (${difficulty})\n\n${content}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${finalTopic.replace(/\s+/g, '_')}_questions.txt`
    a.click()
  }

  return (
  <div className="min-h-screen bg-dark-900 text-white relative">
    <AnimatedBackground />

    <div className="relative z-10">
    <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ListChecks size={20} className="text-primary-400" /> Question Generator
          </h1>
          <p className="text-xs text-gray-400">AI-generated interview questions with answers</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Form */}
        <div className="glass rounded-2xl p-6 border border-white/5 mb-6">
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Select Topic</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {topics.map(t => (
                <button key={t} onClick={() => { setTopic(t); setCustomTopic('') }}
                  className={`text-xs px-3 py-2 rounded-full border transition-all
                    ${topic === t ? 'border-primary-400 bg-primary-900/30 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                  {t}
                </button>
              ))}
            </div>
            <input value={customTopic} onChange={e => { setCustomTopic(e.target.value); setTopic('') }}
              placeholder="Or type custom topic — e.g. 'React Hooks', 'Amazon SDE'"
              className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 text-xs py-2 rounded-lg border transition-all
                      ${difficulty === d ? 'border-primary-400 bg-primary-900/30 text-white' : 'border-white/10 text-gray-400'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Number of Questions</label>
              <select value={count} onChange={e => setCount(Number(e.target.value))}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Questions</option>)}
              </select>
            </div>
          </div>

          <button onClick={generate} disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-400 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
            ) : (
              <><Sparkles size={20} /> Generate Questions</>
            )}
          </button>
        </div>

        {/* Results */}
        {questions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{questions.length} Questions Generated</h3>
              <button onClick={downloadAsText}
                className="flex items-center gap-2 text-sm bg-dark-700 hover:bg-dark-600 px-4 py-2 rounded-lg transition-colors">
                <Download size={16} /> Download
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass rounded-xl border border-white/5 overflow-hidden">
                  <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left">
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-primary-400 font-bold bg-primary-900/30 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-white">{q.question}</p>
                    </div>
                    {openIdx === i ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                  </button>
                  {openIdx === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      className="px-4 pb-4 pl-13">
                      <div className="bg-dark-700/50 rounded-lg p-3 ml-9">
                        <p className="text-xs text-teal-400 font-medium mb-1">Answer</p>
                        <p className="text-sm text-gray-300 leading-relaxed">{q.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </div> 
  )
}