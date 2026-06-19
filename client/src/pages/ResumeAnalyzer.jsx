import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  Upload, FileText, Brain, CheckCircle, XCircle,
  TrendingUp, Award, Zap, ArrowLeft, RotateCcw, Download
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
import jsPDF from 'jspdf'

const CircularProgress = ({ value, size = 140, color = '#7F77DD' }) => {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#1A1A24" strokeWidth="10" />
      <motion.circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ transformOrigin: '60px 60px', transform: 'rotate(-90deg)' }} />
      <text x="60" y="55" textAnchor="middle" fill="white" fontSize="22" fontWeight="700">{value}</text>
      <text x="60" y="72" textAnchor="middle" fill="#888" fontSize="11">/100</text>
    </svg>
  )
}

const ScoreBar = ({ label, value }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-400">{label}</span>
      <span className="text-white font-medium">{value}%</span>
    </div>
    <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
      <motion.div className="h-full rounded-full bg-gradient-to-r from-primary-600 to-primary-400"
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: 'easeOut' }} />
    </div>
  </div>
)

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer?.files[0] || e.target.files[0]
    if (f) setFile(f)
  }, [])

  const analyze = async () => {
    if (!file) return toast.error('Please upload a resume first')
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('resume', file)
      const { data } = await axios.post('http://localhost:5000/api/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      })
      setResult(data.analysis)
      toast.success('Resume analyzed successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getRatingColor = (rating) => {
    const map = { Excellent: '#1D9E75', Good: '#7F77DD', Average: '#EF9F27', Poor: '#E24B4A' }
    return map[rating] || '#7F77DD'
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#1D9E75'
    if (score >= 60) return '#7F77DD'
    if (score >= 40) return '#EF9F27'
    return '#E24B4A'
  }
  const downloadReport = () => {
  const doc = new jsPDF()
  const primaryColor = [127, 119, 221]

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('CareerLaunch AI', 14, 18)
  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text('Resume Analysis Report', 14, 27)

  let y = 48
  doc.setTextColor(20, 20, 20)

  // ATS Score
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text(`ATS Score: ${result.atsScore}/100`, 14, y)
  doc.setFontSize(11)
  doc.setFont(undefined, 'normal')
  doc.text(`Rating: ${result.overallRating}`, 14, y + 7)
  doc.text(`Experience Level: ${result.experienceLevel}`, 14, y + 14)
  y += 28

  // Section Scores
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text('Section Breakdown', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  if (result.sectionScores) {
    Object.entries(result.sectionScores).forEach(([k, v]) => {
      doc.text(`${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}%`, 14, y)
      y += 6
    })
  }
  y += 6

  // Skills Found
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text('Technical Skills Found', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const skillsText = result.technicalSkills?.join(', ') || 'None detected'
  const skillsLines = doc.splitTextToSize(skillsText, 180)
  doc.text(skillsLines, 14, y)
  y += skillsLines.length * 6 + 8

  // Missing Skills
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text('Missing Skills to Add', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  const missingText = result.missingTechnicalSkills?.join(', ') || 'None'
  const missingLines = doc.splitTextToSize(missingText, 180)
  doc.text(missingLines, 14, y)
  y += missingLines.length * 6 + 10

  // New page if needed
  if (y > 240) { doc.addPage(); y = 20 }

  // Strengths
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text('Strengths', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  result.strengths?.forEach(s => {
    const lines = doc.splitTextToSize(`• ${s}`, 180)
    doc.text(lines, 14, y)
    y += lines.length * 6
  })
  y += 8

  if (y > 240) { doc.addPage(); y = 20 }

  // Suggestions
  doc.setFontSize(13)
  doc.setFont(undefined, 'bold')
  doc.text('AI Improvement Suggestions', 14, y)
  y += 8
  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  result.suggestions?.forEach((s, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${s}`, 180)
    if (y > 270) { doc.addPage(); y = 20 }
    doc.text(lines, 14, y)
    y += lines.length * 6 + 2
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('Generated by CareerLaunch AI', 14, 290)
    doc.text(new Date().toLocaleDateString(), 180, 290)
  }

  doc.save('Resume_Analysis_Report.pdf')
  toast.success('Report downloaded!')
}

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
          <h1 className="text-xl font-bold">Resume Analyzer</h1>
          <p className="text-sm text-gray-400">AI-powered ATS score & improvement suggestions</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* Upload Section */}
          {!result && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">

              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} className="text-primary-400" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Analyze Your Resume</h2>
                <p className="text-gray-400">Get instant ATS score, skill gaps & AI suggestions</p>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById('fileInput').click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                  ${dragging ? 'border-primary-400 bg-primary-900/20' : 'border-white/10 hover:border-primary-600/50 hover:bg-white/5'}
                  ${file ? 'border-teal-500/50 bg-teal-900/10' : ''}`}>
                <input id="fileInput" type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={onDrop} />

                {file ? (
                  <div>
                    <CheckCircle size={48} className="text-teal-400 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-white">{file.name}</p>
                    <p className="text-sm text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    <button onClick={(e) => { e.stopPropagation(); setFile(null) }}
                      className="mt-3 text-xs text-gray-500 hover:text-red-400 transition-colors">
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} className="text-gray-600 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-300 mb-1">Drop your resume here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                    <p className="text-xs text-gray-600 mt-3">Supports PDF, DOCX, TXT — Max 5MB</p>
                  </div>
                )}
              </div>

              <button onClick={analyze} disabled={!file || loading}
                className="w-full mt-6 bg-primary-600 hover:bg-primary-400 disabled:opacity-40 disabled:cursor-not-allowed
                  text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Analyzing with Groq AI...
                  </>
                ) : (
                  <><Brain size={22} /> Analyze Resume</>
                )}
              </button>

              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 glass rounded-xl p-4">
                  <p className="text-sm text-gray-400 text-center mb-3">AI is analyzing your resume...</p>
                  <div className="space-y-2">
                    {['Extracting text & skills', 'Calculating ATS score', 'Finding skill gaps', 'Generating suggestions'].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }}
                        className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                        {s}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Results Section */}
          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              {/* Top Score Row */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">

                {/* ATS Score */}
                <div className="glass rounded-2xl p-6 text-center border border-white/5">
                  <p className="text-gray-400 text-sm mb-4">ATS Score</p>
                  <div className="flex justify-center mb-3">
                    <CircularProgress value={result.atsScore} color={getScoreColor(result.atsScore)} />
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium"
                    style={{ background: getRatingColor(result.overallRating) + '20', color: getRatingColor(result.overallRating) }}>
                    {result.overallRating}
                  </span>
                </div>

                {/* Section Scores */}
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-gray-400 text-sm mb-4">Section Breakdown</p>
                  {result.sectionScores && Object.entries(result.sectionScores).map(([k, v]) => (
                    <ScoreBar key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} value={v} />
                  ))}
                </div>

                {/* Quick Info */}
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-gray-400 text-sm mb-4">Quick Summary</p>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Experience Level</span>
                      <span className="text-white text-sm font-medium">{result.experienceLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Technical Skills</span>
                      <span className="text-teal-400 text-sm font-medium">{result.technicalSkills?.length || 0} found</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Missing Skills</span>
                      <span className="text-red-400 text-sm font-medium">{result.missingTechnicalSkills?.length || 0} gaps</span>
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-gray-400 text-xs mb-2">Top Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {result.topKeywords?.map((k, i) => (
                          <span key={i} className="text-xs bg-primary-900/40 text-primary-300 px-2 py-0.5 rounded-full">{k}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Row */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">

                {/* Found Skills */}
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={18} className="text-teal-400" />
                    <h3 className="font-semibold">Technical Skills Found</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.technicalSkills?.map((s, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className="px-3 py-1 bg-teal-900/30 text-teal-300 border border-teal-700/30 rounded-full text-sm">
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle size={18} className="text-red-400" />
                    <h3 className="font-semibold">Missing Skills to Add</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingTechnicalSkills?.map((s, i) => (
                      <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                        className="px-3 py-1 bg-red-900/30 text-red-300 border border-red-700/30 rounded-full text-sm">
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-green-400" />
                    <h3 className="font-semibold">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass rounded-2xl p-6 border border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle size={18} className="text-orange-400" />
                    <h3 className="font-semibold">Weaknesses</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">!</span> {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="glass rounded-2xl p-6 border border-primary-600/20 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={18} className="text-primary-400" />
                  <h3 className="font-semibold">AI Improvement Suggestions</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {result.suggestions?.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-3 bg-dark-700/50 rounded-xl p-3">
                      <span className="w-6 h-6 bg-primary-900/50 text-primary-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-300">{s}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Project Analysis */}
              {result.projectAnalysis && (
                <div className="glass rounded-2xl p-6 border border-white/5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Award size={18} className="text-yellow-400" />
                    <h3 className="font-semibold">Project Analysis</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{result.projectAnalysis}</p>
                </div>
              )}

             {/* Action Buttons */}
<div className="grid grid-cols-2 gap-4">
  <button onClick={downloadReport}
    className="bg-primary-600 hover:bg-primary-400 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2">
    <Download size={18} /> Download PDF Report
  </button>
  <button onClick={() => { setResult(null); setFile(null) }}
    className="glass border border-white/10 hover:border-primary-600/50 text-white py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2">
    <RotateCcw size={18} /> Analyze Another
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