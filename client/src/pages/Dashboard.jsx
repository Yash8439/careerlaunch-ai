import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import {
  Brain, FileText, Mic, Map, BookOpen, Zap, LogOut, User, TrendingUp,
  Award, Flame, ListChecks, Clock, Sparkles, AlertTriangle, PartyPopper, Calendar
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import AnimatedBackground from '../components/AnimatedBackground'
import TiltCard from '../components/TiltCard'
import { API_URL } from '../config'

const navItems = [
  { icon: TrendingUp, label: 'Dashboard', path: '/dashboard', active: true },
  { icon: FileText, label: 'Resume Analyzer', path: '/resume' },
  { icon: Brain, label: 'AI Chatbot', path: '/chat' },
  { icon: Mic, label: 'Mock Interview', path: '/interview' },
  { icon: Map, label: 'Roadmap', path: '/roadmap' },
  { icon: ListChecks, label: 'Question Bank', path: '/questions' },
  { icon: BookOpen, label: 'Resources', path: '/resources' },
]

const quickActions = [
  { icon: FileText, title: 'Analyze Resume', desc: 'Get ATS score & suggestions', color: 'from-primary-900/50 to-primary-800/20', border: 'border-primary-600/30', path: '/resume' },
  { icon: Mic, title: 'Start Interview', desc: 'Practice with AI interviewer', color: 'from-teal-900/50 to-teal-800/20', border: 'border-teal-600/30', path: '/interview' },
  { icon: Map, title: 'Generate Roadmap', desc: 'Get your personalized plan', color: 'from-blue-900/50 to-blue-800/20', border: 'border-blue-600/30', path: '/roadmap' },
  { icon: Brain, title: 'Chat with Notes', desc: 'Upload & ask questions', color: 'from-pink-900/50 to-pink-800/20', border: 'border-pink-600/30', path: '/chat' },
]

const activityLabels = {
  resume_analysis: { label: 'Resume Analyzed', icon: FileText, color: 'text-primary-400' },
  mock_interview: { label: 'Mock Interview Completed', icon: Mic, color: 'text-teal-400' },
  roadmap_generated: { label: 'Roadmap Generated', icon: Map, color: 'text-blue-400' },
  questions_generated: { label: 'Questions Generated', icon: ListChecks, color: 'text-yellow-400' },
}

const skillColors = {
  DSA: '#7F77DD', OS: '#1D9E75', DBMS: '#EF9F27', OOPS: '#E24B4A', WebDev: '#3B8BD4'
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-primary-400">{payload[0].value}/100</p>
      </div>
    )
  }
  return null
}
const generateHeatmapGrid = (heatmapData) => {
  const dataMap = {}
  heatmapData.forEach(d => { dataMap[d.date] = d.count })

  const weeks = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 90)

  // Align to start of week (Sunday)
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  let currentDate = new Date(startDate)
  while (currentDate <= today) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const dateKey = currentDate.toISOString().split('T')[0]
      week.push({
        date: dateKey,
        count: dataMap[dateKey] || 0,
        isFuture: currentDate > today,
        dayLabel: currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

const getHeatColor = (count) => {
  if (count === 0) return '#1A1A24'
  if (count === 1) return '#2D2A6E'
  if (count === 2) return '#4A44A8'
  if (count >= 3) return '#7F77DD'
  return '#1A1A24'
}

const getMonthLabels = (heatmapData) => {
  const weeks = generateHeatmapGrid(heatmapData)
  const labels = []
  let currentMonth = null
  let weekCount = 0

  weeks.forEach((week, idx) => {
    const firstDay = new Date(week[0].date)
    const month = firstDay.toLocaleDateString('en-IN', { month: 'short' })

    if (month !== currentMonth) {
      if (currentMonth !== null) {
        labels.push({ label: currentMonth, weekSpan: weekCount })
      }
      currentMonth = month
      weekCount = 1
    } else {
      weekCount++
    }

    if (idx === weeks.length - 1) {
      labels.push({ label: currentMonth, weekSpan: weekCount })
    }
  })

  return labels
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [advice, setAdvice] = useState(null)
const [adviceLoading, setAdviceLoading] = useState(true)
const [resumeHistory, setResumeHistory] = useState([])
const [heatmap, setHeatmap] = useState([])
const [achievements, setAchievements] = useState([])

  useEffect(() => {
  fetchDashboard()
  fetchAdvice()
  fetchResumeHistory()
  fetchHeatmap()
   fetchAchievements()
}, [])
const fetchAchievements = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/dashboard/achievements`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    setAchievements(data.achievements)
  } catch (err) {
    console.error('Failed to fetch achievements', err)
  }
}

const fetchHeatmap = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/dashboard/heatmap`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    setHeatmap(data.heatmap)
  } catch (err) {
    console.error('Failed to fetch heatmap', err)
  }
}

const fetchResumeHistory = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/dashboard/resume-history`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    setResumeHistory(data.history)
  } catch (err) {
    console.error('Failed to fetch resume history', err)
  }
}
const fetchDashboard = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    setStats(data.stats)
    setActivity(data.recentActivity)
  } catch (err) {
    console.error('Failed to fetch dashboard', err)
  } finally {
    setLoading(false)
  }
}

const fetchAdvice = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/coach/daily-advice`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
    setAdvice(data.advice)
  } catch (err) {
    console.error('Failed to fetch advice', err)
  } finally {
    setAdviceLoading(false)
  }
}

  const handleLogout = () => {
    logout()
    toast.success('Logged out!')
    navigate('/')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  const statCards = [
    { label: 'Resume Score', value: stats?.resumeScore || 0, unit: '/100', icon: FileText, color: 'text-primary-400', bg: 'bg-primary-900/30' },
    { label: 'Interviews Done', value: stats?.interviewsCompleted || 0, unit: '', icon: Mic, color: 'text-teal-400', bg: 'bg-teal-900/30' },
    { label: 'Study Streak', value: stats?.studyStreak || 0, unit: ' days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-900/30' },
    { label: 'Activities', value: stats?.totalActivities || 0, unit: '', icon: Award, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  ]

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

 return (
  <div className="min-h-screen bg-dark-900 flex relative">
    <AnimatedBackground />

    {/* Sidebar */}
      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.3 }}
  className="w-64 bg-dark-800/95 backdrop-blur-xl border-r border-white/10 flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">CareerLaunch <span className="gradient-text">AI</span></span>
          </div>
        </div>

<nav className="flex-1 p-4 space-y-1">
  {navItems.map((item, i) => (
    <Link key={i} to={item.path}
      className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden
        ${item.active
          ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
          : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
        }`}>
      {item.active && (
        <motion.div layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary-400 rounded-r-full" />
      )}
      <item.icon size={18} className="transition-transform group-hover:scale-110" />
      {item.label}
    </Link>
  ))}
</nav>

        <Link to="/settings" className="flex items-center gap-3 mb-3 hover:bg-white/5 rounded-lg p-1 -m-1 transition-colors">
  {user?.avatar ? (
    <img src={user.avatar} alt="Profile" className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-400/30" />
  ) : (
    <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-primary-400/30">
      {initials}
    </div>
  )}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
  </div>
</Link>

          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all">
            <LogOut size={16} /> Logout
          </button>
      </motion.aside>

{/* Main Content */}
<main className="flex-1 ml-64 p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">
  {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
</h1>
              <p className="text-gray-400">Ready to crack your placements today?</p>
            </div>
            {stats?.studyStreak > 0 && (
              <div className="flex items-center gap-2 bg-orange-900/20 border border-orange-700/30 rounded-xl px-4 py-2">
                <Flame size={20} className="text-orange-400" />
                <span className="text-orange-300 font-semibold">{stats.studyStreak} day streak!</span>
              </div>
            )}
          </div>
          {/* AI Career Coach Card */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
  className={`glass rounded-2xl p-6 mb-8 border-2 relative overflow-hidden
    ${advice?.mood === 'celebratory' ? 'border-teal-600/40' : advice?.mood === 'warning' ? 'border-orange-600/40' : 'border-primary-600/40'}`}>
  
  <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20"
    style={{ background: advice?.mood === 'celebratory' ? '#1D9E75' : advice?.mood === 'warning' ? '#D85A30' : '#7F77DD' }} />

  <div className="flex items-start gap-4 relative z-10">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
      ${advice?.mood === 'celebratory' ? 'bg-teal-900/40' : advice?.mood === 'warning' ? 'bg-orange-900/40' : 'bg-primary-900/40'}`}>
      {advice?.mood === 'celebratory' ? <PartyPopper size={24} className="text-teal-400" /> :
       advice?.mood === 'warning' ? <AlertTriangle size={24} className="text-orange-400" /> :
       <Sparkles size={24} className="text-primary-400" />}
    </div>

    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <h3 className="text-sm font-medium text-gray-400">AI Career Coach</h3>
        <span className="text-xs bg-dark-700 text-gray-500 px-2 py-0.5 rounded-full">Today's Advice</span>
      </div>

      {adviceLoading ? (
        <div className="space-y-2">
          <div className="h-5 bg-dark-700 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-dark-700 rounded animate-pulse w-3/4" />
        </div>
      ) : advice ? (
        <>
          <h2 className="text-xl font-bold text-white mb-3">{advice.headline}</h2>
          <div className="space-y-1.5 mb-4">
            {advice.insights?.map((insight, i) => (
              <p key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-primary-400 mt-0.5">•</span> {insight}
              </p>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-dark-700/50 rounded-xl px-4 py-2.5 inline-flex">
            <Zap size={14} className="text-yellow-400 flex-shrink-0" />
            <span className="text-sm text-white font-medium">{advice.actionItem}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-500">Complete some activities to get personalized advice!</p>
      )}
    </div>
  </div>
</motion.div>

          {/* Stats Grid */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {statCards.map((s, i) => (
    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}>
      <TiltCard className="glass rounded-2xl p-5 border border-white/5 hover:border-primary-600/30 transition-colors">
        <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3 relative z-10 ring-1 ring-white/5`}>
          <s.icon size={20} className={s.color} />
        </div>
        <div className="text-2xl font-bold text-white relative z-10">
          {loading ? '...' : s.value}<span className="text-sm text-gray-400 font-normal">{s.unit}</span>
        </div>
        <div className="text-sm text-gray-400 mt-1 relative z-10">{s.label}</div>
      </TiltCard>
    </motion.div>
  ))}
</div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                    <Link to={a.path}
                      className={`block bg-gradient-to-br ${a.color} rounded-2xl p-5 border ${a.border} hover:border-opacity-60 transition-all duration-200 group h-full`}>
                      <a.icon size={24} className="text-white mb-3 group-hover:scale-110 transition-transform duration-200" />
                      <h3 className="font-semibold text-white mb-1">{a.title}</h3>
                      <p className="text-xs text-gray-400">{a.desc}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Clock size={16} className="text-gray-400" /> Recent Activity
              </h2>
              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : activity.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet. Start exploring features!</p>
              ) : (
                <div className="space-y-3">
                  {activity.map((a, i) => {
                    const info = activityLabels[a.type] || { label: a.type, icon: Award, color: 'text-gray-400' }
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0 ${info.color}`}>
                          <info.icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300">{info.label}</p>
                          <p className="text-xs text-gray-500">{timeAgo(a.createdAt)} {a.score ? `• ${a.score}%` : ''}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
          {/* Resume Score History */}
{resumeHistory.length > 0 && (
  <div className="glass rounded-2xl p-6 border border-white/5 mb-8">
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp size={18} className="text-primary-400" /> Resume Score Progress
      </h2>
      <span className="text-xs text-gray-500">{resumeHistory.length} analyses</span>
    </div>

    {resumeHistory.length === 1 ? (
      <div className="text-center py-8">
        <p className="text-3xl font-bold text-primary-400 mb-2">{resumeHistory[0].score}/100</p>
        <p className="text-sm text-gray-500">Analyze your resume again to see progress over time</p>
      </div>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={resumeHistory}>
          <CartesianGrid strokeDasharray="3 3" stroke="#22222F" vertical={false} />
          <XAxis dataKey="date" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="score" stroke="#7F77DD" strokeWidth={3}
            dot={{ fill: '#7F77DD', r: 5 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    )}

    {resumeHistory.length > 1 && (
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className={`text-sm font-medium ${resumeHistory[resumeHistory.length-1].score >= resumeHistory[0].score ? 'text-teal-400' : 'text-red-400'}`}>
          {resumeHistory[resumeHistory.length-1].score >= resumeHistory[0].score ? '↑' : '↓'} 
          {Math.abs(resumeHistory[resumeHistory.length-1].score - resumeHistory[0].score)} points
        </span>
        <span className="text-xs text-gray-500">since first analysis</span>
      </div>
    )}
  </div>
)}
{/* Activity Heatmap */}
<div className="glass rounded-2xl p-6 border border-white/5 mb-8 overflow-x-auto">
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-lg font-semibold flex items-center gap-2">
      <Calendar size={18} className="text-primary-400" /> Activity Heatmap
    </h2>
    <span className="text-xs text-gray-500">Last 90 days</span>
  </div>

  <div className="min-w-max">
    {/* Month labels on top */}
    <div className="flex gap-1 mb-1.5 ml-0">
      {getMonthLabels(heatmap).map((m, i) => (
        <div key={i} style={{ width: `${m.weekSpan * 16}px` }} className="text-xs text-gray-500">
          {m.label}
        </div>
      ))}
    </div>

    {/* Heatmap grid */}
    <div className="flex gap-1">
      {generateHeatmapGrid(heatmap).map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day, di) => (
            <div key={di}
              title={`${day.dayLabel}: ${day.count} activities`}
              className={`w-3.5 h-3.5 rounded-sm transition-all ${day.isFuture ? 'opacity-0' : 'hover:scale-125 cursor-pointer'}`}
              style={{ backgroundColor: day.isFuture ? 'transparent' : getHeatColor(day.count) }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>

  <div className="flex items-center justify-end gap-2 mt-4">
    <span className="text-xs text-gray-500">Less</span>
    {[0, 1, 2, 3].map(c => (
      <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getHeatColor(c) }} />
    ))}
    <span className="text-xs text-gray-500">More</span>
  </div>
</div>
          {/* Skill Tracker */}
          <div className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
              <Award size={18} className="text-primary-400" /> Skill Progress Tracker
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {stats?.skillProgress && Object.entries(stats.skillProgress).map(([skill, value]) => (
                <div key={skill}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 font-medium">{skill}</span>
                    <span className="text-gray-400">{value}%</span>
                  </div>
                  <div className="h-2.5 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ background: skillColors[skill] }}
                      initial={{ width: 0 }} animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>


  {/* Achievements */}
<div className="glass rounded-2xl p-6 border border-white/5 mt-8">
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-lg font-semibold flex items-center gap-2">
      <Award size={18} className="text-primary-400" /> Achievements
    </h2>
    <span className="text-xs text-gray-500">
      {achievements.filter(a => a.unlocked).length}/{achievements.length} unlocked
    </span>
  </div>

  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
    {achievements.map((badge, i) => (
      <motion.div key={badge.id}
        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: i * 0.05 }}
        title={badge.desc}
        className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all
          ${badge.unlocked ? 'bg-primary-900/20 border-primary-600/30' : 'bg-dark-800/50 border-white/5 opacity-40'}`}>
        <span className="text-3xl mb-2">{badge.unlocked ? badge.icon : '🔒'}</span>
        <p className="text-xs font-medium text-white leading-tight">{badge.label}</p>
      </motion.div>
    ))}
  </div>
</div>

 </motion.div>
      </main>
    </div>
    
  )
}