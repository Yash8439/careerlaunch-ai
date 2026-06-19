import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Mic, MicOff, Send, Brain, Trophy,
  Clock, ChevronRight, RotateCcw, CheckCircle,
  XCircle, TrendingUp, AlertCircle
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
const roles = [
  { id: 'Full Stack Developer', label: 'Full Stack', icon: '⚡' },
  { id: 'Frontend Developer', label: 'Frontend', icon: '🎨' },
  { id: 'Backend Developer', label: 'Backend', icon: '⚙️' },
  { id: 'Data Structures & Algorithms', label: 'DSA', icon: '🧮' },
  { id: 'Java Developer', label: 'Java', icon: '☕' },
  { id: 'Data Analyst', label: 'Data Analyst', icon: '📊' },
]

const difficulties = [
  { id: 'Beginner', color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-700/30' },
  { id: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/30' },
  { id: 'Advanced', color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-700/30' },
]

const ScoreCircle = ({ score, size = 80 }) => {
  const color = score >= 75 ? '#1D9E75' : score >= 50 ? '#EF9F27' : '#E24B4A'
  const r = 30
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r={r} fill="none" stroke="#1A1A24" strokeWidth="6" />
      <motion.circle cx="35" cy="35" r={r} fill="none" stroke={color} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ transformOrigin: '35px 35px', transform: 'rotate(-90deg)' }} />
      <text x="35" y="39" textAnchor="middle" fill="white" fontSize="14" fontWeight="700">{score}</text>
    </svg>
  )
}

const UserCamera = ({ listening }) => {
  const videoRef = useRef(null)
  const [camOn, setCamOn] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCamOn(true)
        }
      })
      .catch(() => setError(true))
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return (
    <div className="relative rounded-2xl overflow-hidden bg-dark-800 border border-white/10"
      style={{height: '320px'}}>
      {camOn ? (
        <video ref={videoRef} autoPlay muted playsInline
          className="w-full h-full object-cover scale-x-[-1]" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl">👤</span>
          </div>
          <p className="text-sm text-gray-500">{error ? 'Camera not available' : 'Starting camera...'}</p>
        </div>
      )}

      {/* Mic indicator */}
      {listening && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i} className="w-1 bg-red-400 rounded-full"
              animate={{ height: [4, 16+i*2, 4] }}
              transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.08 }} />
          ))}
        </div>
      )}

      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
        <p className="text-xs text-white font-medium">You</p>
      </div>

      {listening && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500/80 rounded-full px-2 py-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          <span className="text-xs text-white font-medium">LIVE</span>
        </div>
      )}
    </div>
  )
}

export default function MockInterview() {
  const [phase, setPhase] = useState('setup')
  const [role, setRole] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answer, setAnswer] = useState('')
  const [answers, setAnswers] = useState([])
  const [evaluating, setEvaluating] = useState(false)
  const [currentEval, setCurrentEval] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(120)
  const [timerActive, setTimerActive] = useState(false)
  const [listening, setListening] = useState(false)
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    if (timerActive && timer > 0) {
      timerRef.current = setTimeout(() => setTimer(t => t - 1), 1000)
    } else if (timer === 0) {
      handleSubmitAnswer()
    }
    return () => clearTimeout(timerRef.current)
  }, [timer, timerActive])

  // ✅ speakQuestion PEHLE define karo
  const speakQuestion = (text) => {
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.9
  utterance.pitch = 1.1
  utterance.volume = 1
  utterance.onstart = () => setIsSpeaking(true)
  utterance.onend = () => setIsSpeaking(false)
  window.speechSynthesis.speak(utterance)
}

  const startInterview = async () => {
    if (!role || !difficulty) return toast.error('Please select role and difficulty')
    setLoading(true)
    try {
      const { data } = await axios.post('http://localhost:5000/api/interview/generate',
        { role, difficulty },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setQuestions(data.questions)
      setPhase('interview')
      setTimer(120)
      setTimerActive(true)
      setTimeout(() => speakQuestion(data.questions[0].question), 500)
      toast.success('Interview started! Good luck!')
    } catch (err) {
      toast.error('Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (evaluating) return
    setTimerActive(false)
    setEvaluating(true)
    try {
      const q = questions[currentQ]
      const { data } = await axios.post('http://localhost:5000/api/interview/evaluate',
        {
          question: q.question,
          answer: answer || 'No answer provided',
          expectedPoints: q.expectedPoints,
          role, difficulty,
          topic: q.topic
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      const evalResult = { ...data, topic: q.topic, question: q.question, answer }
      setCurrentEval(evalResult)
      setAnswers(prev => [...prev, evalResult])
    } catch (err) {
      toast.error('Evaluation failed')
    } finally {
      setEvaluating(false)
    }
  }

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1)
      setAnswer('')
      setCurrentEval(null)
      setTimer(120)
      setTimerActive(true)
      setTimeout(() => speakQuestion(questions[currentQ + 1].question), 300)
    } else {
      generateReport()
    }
  }

  const generateReport = async () => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/interview/report',
        { answers, role, difficulty },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setReport(data)
      setPhase('result')
    } catch (err) {
      toast.error('Failed to generate report')
    }
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return toast.error('Voice not supported in this browser')
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SR()
    recognitionRef.current.continuous = true
    recognitionRef.current.interimResults = true
    recognitionRef.current.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setAnswer(transcript)
    }
    recognitionRef.current.start()
    setListening(true)
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
  <div className="min-h-screen bg-dark-900 text-white relative">
    <AnimatedBackground />

    <div className="relative z-10">
    {/* Header */}
    <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Mic size={20} className="text-primary-400" /> AI Mock Interview
          </h1>
          <p className="text-xs text-gray-400">Practice with AI interviewer</p>
        </div>
        {phase === 'interview' && (
          <div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold
            ${timer <= 30 ? 'text-red-400 bg-red-900/20' : 'text-white bg-dark-700'}`}>
            <Clock size={18} />
            {formatTime(timer)}
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* Setup Phase */}
          {phase === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain size={32} className="text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Choose Your Interview</h2>
                <p className="text-gray-400">Select role and difficulty to start</p>
              </div>

              <div className="glass rounded-2xl p-6 mb-6 border border-white/5">
                <h3 className="font-semibold mb-4 text-gray-300">Select Role</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roles.map(r => (
                    <button key={r.id} onClick={() => setRole(r.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200
                        ${role === r.id
                          ? 'border-primary-400 bg-primary-900/30 text-white'
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                        }`}>
                      <div className="text-2xl mb-1">{r.icon}</div>
                      <div className="text-sm font-medium">{r.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-6 mb-8 border border-white/5">
                <h3 className="font-semibold mb-4 text-gray-300">Select Difficulty</h3>
                <div className="grid grid-cols-3 gap-3">
                  {difficulties.map(d => (
                    <button key={d.id} onClick={() => setDifficulty(d.id)}
                      className={`p-4 rounded-xl border text-center transition-all duration-200
                        ${difficulty === d.id
                          ? `${d.border} ${d.bg} ${d.color} border-2`
                          : 'border-white/10 hover:border-white/20 text-gray-400'
                        }`}>
                      <div className="font-semibold">{d.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={startInterview} disabled={!role || !difficulty || loading}
                className="w-full bg-primary-600 hover:bg-primary-400 disabled:opacity-40 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating Questions...</>
                ) : (
                  <><Brain size={22} /> Start Interview</>
                )}
              </button>
            </motion.div>
          )}

{/* Interview Phase */}
{phase === 'interview' && questions[currentQ] && (
  <motion.div key={`q-${currentQ}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

    {/* Progress */}
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-gray-400">Question {currentQ + 1} of {questions.length}</span>
      <div className="flex gap-1.5">
        {questions.map((_, i) => (
          <div key={i} className={`h-1.5 w-8 rounded-full transition-all
            ${i < currentQ ? 'bg-teal-500' : i === currentQ ? 'bg-primary-400' : 'bg-dark-600'}`} />
        ))}
      </div>
      <span className="text-xs text-gray-500 bg-dark-700 px-3 py-1 rounded-full">
        {questions[currentQ].topic}
      </span>
    </div>

    {/* VIDEO CALL LAYOUT */}
    <div className="grid grid-cols-2 gap-4 mb-4">

      {/* AI Interviewer — Left */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 border border-white/10"
        style={{height: '320px'}}>

        {/* Office background */}
        <div className="absolute inset-0 opacity-20"
          style={{background: 'radial-gradient(ellipse at center, #1e3a5f 0%, #0a0a0f 70%)'}}>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>

        {/* Bookshelf decoration */}
        <div className="absolute top-4 left-4 right-4 flex gap-1 opacity-30">
          {['#7F77DD','#1D9E75','#D85A30','#3B8BD4','#7F77DD','#1D9E75'].map((c,i) => (
            <div key={i} className="rounded-sm" style={{width:'12px', height:`${28+i*4}px`, background:c}} />
          ))}
        </div>

        {/* AI Avatar */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Head */}
          <div className="relative mb-2">
            {/* Hair */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-14 rounded-t-full"
              style={{background: 'linear-gradient(180deg, #2C1810 0%, #4A2818 100%)'}} />
            {/* Side hair */}
            <div className="absolute top-2 -left-2 w-5 h-16 rounded-l-full"
              style={{background: '#2C1810'}} />
            <div className="absolute top-2 -right-2 w-5 h-16 rounded-r-full"
              style={{background: '#2C1810'}} />

            {/* Face */}
            <div className="relative w-16 h-20 rounded-full overflow-hidden z-10"
              style={{background: 'linear-gradient(180deg, #FDBCB4 0%, #F4A190 100%)'}}>

              {/* Eyes */}
              <div className="absolute top-6 left-0 right-0 flex justify-center gap-4">
                <div className="relative w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <motion.div className="w-2.5 h-2.5 bg-gray-800 rounded-full"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} />
                </div>
                <div className="relative w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <motion.div className="w-2.5 h-2.5 bg-gray-800 rounded-full"
                    animate={{ scaleY: [1, 0.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }} />
                </div>
              </div>

              {/* Eyebrows */}
              <div className="absolute top-4 left-0 right-0 flex justify-center gap-3">
                <div className="w-4 h-0.5 rounded-full bg-gray-700" style={{transform:'rotate(-5deg)'}} />
                <div className="w-4 h-0.5 rounded-full bg-gray-700" style={{transform:'rotate(5deg)'}} />
              </div>

              {/* Nose */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-1.5 h-2 rounded-full bg-rose-300 opacity-60" />

              {/* Mouth — animates when speaking */}
              <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2"
                animate={isSpeaking ? {
                  scaleY: [1, 1.5, 0.8, 1.3, 1],
                  scaleX: [1, 1.2, 0.9, 1.1, 1]
                } : { scaleY: 1 }}
                transition={{ duration: 0.3, repeat: isSpeaking ? Infinity : 0 }}>
                <div className="w-6 h-2 rounded-full border-b-2 border-rose-400"
                  style={{background: isSpeaking ? '#e8a0a0' : 'transparent'}} />
              </motion.div>
            </div>

            {/* Neck */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-5 z-10"
              style={{background: '#FDBCB4'}} />
          </div>

          {/* Body / Professional outfit */}
          <div className="relative z-10 w-32 h-24 rounded-t-3xl mt-1"
            style={{background: 'linear-gradient(180deg, #1a3a5c 0%, #0f2340 100%)'}}>
            {/* Collar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-6 bg-white rounded-b-lg" />
            {/* Lapels */}
            <div className="absolute top-0 left-8 w-6 h-8 rounded-br-xl"
              style={{background: '#1a3a5c', borderRight: '2px solid #2a4a6c'}} />
            <div className="absolute top-0 right-8 w-6 h-8 rounded-bl-xl"
              style={{background: '#1a3a5c', borderLeft: '2px solid #2a4a6c'}} />
          </div>
        </div>

        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div key={i} className="w-1 bg-primary-400 rounded-full"
                animate={{ height: [4, 12+i*3, 4] }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }} />
            ))}
          </div>
        )}

        {/* Name tag */}
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
          <p className="text-xs text-white font-medium">Sarah — AI Interviewer</p>
        </div>
      </div>

      {/* User Camera — Right */}
      <UserCamera listening={listening} />
    </div>

    {/* Question */}
    <div className="glass rounded-xl p-4 mb-4 border border-primary-600/20">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base text-white leading-relaxed">{questions[currentQ].question}</p>
        <button onClick={() => speakQuestion(questions[currentQ].question)}
          className="p-2 bg-primary-900/30 hover:bg-primary-900/50 rounded-lg transition-colors flex-shrink-0 text-lg">
          🔊
        </button>
      </div>
    </div>

    {/* Controls */}
    {!currentEval && (
      <div className="glass rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between">

          {/* Live transcript */}
          <div className="flex-1 mr-4">
            {answer ? (
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{answer}</p>
            ) : (
              <p className="text-sm text-gray-600">
                {listening ? '🎤 Listening...' : 'Tap mic to answer'}
              </p>
            )}
          </div>

          {/* Mic + Submit */}
          <div className="flex items-center gap-3">
            <button onClick={listening ? stopVoice : startVoice}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                ${listening ? 'bg-red-500 scale-110 animate-pulse' : 'bg-primary-600 hover:bg-primary-400'}`}>
              {listening ? <MicOff size={22} className="text-white" /> : <Mic size={22} className="text-white" />}
            </button>

            {answer && !listening && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                onClick={handleSubmitAnswer} disabled={evaluating}
                className="w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 flex items-center justify-center transition-all">
                {evaluating
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Send size={20} className="text-white" />
                }
              </motion.button>
            )}
          </div>
        </div>

        <button onClick={handleSubmitAnswer} disabled={evaluating}
          className="mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors w-full text-center">
          Skip this question
        </button>
      </div>
    )}

    {/* Eval Result */}
    {currentEval && (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-5 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Evaluation</h3>
          <ScoreCircle score={currentEval.score} size={60} />
        </div>
        <p className="text-sm text-gray-300 mb-3">{currentEval.feedback}</p>
        {currentEval.goodPoints?.length > 0 && (
          <div className="mb-2">
            <p className="text-xs text-teal-400 font-medium mb-1">✓ Good Points</p>
            {currentEval.goodPoints.map((p, i) => <p key={i} className="text-xs text-gray-400 ml-3">• {p}</p>)}
          </div>
        )}
        {currentEval.improvements?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-orange-400 font-medium mb-1">! Improvements</p>
            {currentEval.improvements.map((p, i) => <p key={i} className="text-xs text-gray-400 ml-3">• {p}</p>)}
          </div>
        )}
        <button onClick={nextQuestion}
          className="w-full bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 text-sm">
          {currentQ < questions.length - 1 ? <><ChevronRight size={16} /> Next Question</> : <><Trophy size={16} /> View Report</>}
        </button>
      </motion.div>
    )}

  </motion.div>
)}
          {/* Result Phase */}
          {phase === 'result' && report && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-24 h-24 mx-auto mb-4">
                  <ScoreCircle score={report.totalScore} size={96} />
                </motion.div>
                <h2 className="text-3xl font-bold mb-1">Interview Complete!</h2>
                <p className="text-gray-400">{role} — {difficulty}</p>
                <div className={`inline-block mt-3 px-6 py-2 rounded-full text-lg font-bold
                  ${report.passed ? 'bg-teal-900/30 text-teal-400 border border-teal-700/30' : 'bg-red-900/30 text-red-400 border border-red-700/30'}`}>
                  Grade: {report.grade} — {report.passed ? 'Passed! 🎉' : 'Need Practice'}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Overall Score', value: report.totalScore + '%', color: 'text-primary-400' },
                  { label: 'Technical Accuracy', value: report.avgTechnical + '%', color: 'text-teal-400' },
                  { label: 'Questions Done', value: report.totalQuestions, color: 'text-yellow-400' },
                ].map((s, i) => (
                  <div key={i} className="glass rounded-2xl p-5 text-center border border-white/5">
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-sm text-gray-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {report.strongTopics?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-teal-700/20">
                    <h3 className="font-semibold text-teal-400 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} /> Strong Areas
                    </h3>
                    {report.strongTopics.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                        <CheckCircle size={14} className="text-teal-400" /> {t}
                      </div>
                    ))}
                  </div>
                )}
                {report.weakTopics?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-red-700/20">
                    <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle size={16} /> Weak Areas
                    </h3>
                    {report.weakTopics.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                        <XCircle size={14} className="text-red-400" /> {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="glass rounded-2xl p-5 border border-white/5 mb-6">
                <h3 className="font-semibold mb-4">Question-wise Breakdown</h3>
                <div className="space-y-3">
                  {answers.map((a, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className="text-xs text-gray-500 w-6">Q{i + 1}</span>
                      <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${a.score}%` }}
                          transition={{ delay: i * 0.1 }}
                          className={`h-full rounded-full ${a.score >= 75 ? 'bg-teal-500' : a.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{a.score}%</span>
                      <span className="text-xs text-gray-500 w-24 truncate">{a.topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setPhase('setup'); setAnswers([]); setCurrentQ(0); setCurrentEval(null) }}
                  className="flex-1 glass border border-white/10 hover:border-primary-600/50 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                  <RotateCcw size={18} /> Try Again
                </button>
                <button onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-primary-600 hover:bg-primary-400 text-white py-3 rounded-xl font-medium transition-all">
                  Back to Dashboard
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
    </div>
  )
}