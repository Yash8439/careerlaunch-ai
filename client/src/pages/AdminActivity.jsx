import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import {
  Users, Activity, BarChart3, BookOpen, LogOut, Shield, Brain,
  FileText, Mic, Map, ListChecks
} from 'lucide-react'

const navItems = [
  { icon: BarChart3, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Activity, label: 'Activity Feed', path: '/admin/activity', active: true },
  { icon: BookOpen, label: 'Resources', path: '/admin/resources' },
]

const typeIcons = {
  resume_analysis: { icon: FileText, color: 'text-primary-400', label: 'Resume Analysis' },
  mock_interview: { icon: Mic, color: 'text-teal-400', label: 'Mock Interview' },
  roadmap_generated: { icon: Map, color: 'text-blue-400', label: 'Roadmap Generated' },
  questions_generated: { icon: ListChecks, color: 'text-yellow-400', label: 'Questions Generated' },
}

export default function AdminActivity() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [])

  const fetchActivity = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/activity', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setActivities(data.activities)
    } catch (err) {
      toast.error('Failed to load activity feed')
    } finally {
      setLoading(false)
    }
  }

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

      <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} transition={{ duration: 0.3 }}
        className="w-64 bg-dark-800/95 backdrop-blur-xl border-r border-white/10 flex flex-col fixed h-full z-40">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg block leading-tight">Admin <span className="text-red-400">Panel</span></span>
              <span className="text-xs text-gray-500">CareerLaunch AI</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item, i) => (
            <Link key={i} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${item.active ? 'bg-red-600/20 text-red-400 border border-red-600/30' : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <Link to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-white transition-all mt-4 border-t border-white/5 pt-4">
            <Brain size={18} /> Back to User View
          </Link>
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => { logout(); navigate('/') }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 ml-64 p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1">Activity Feed</h1>
            <p className="text-gray-400">Real-time activity across all users</p>
          </div>

          <div className="glass rounded-2xl border border-white/5 divide-y divide-white/5">
            {loading ? (
              <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No activity yet</p>
            ) : activities.map((a, i) => {
              const info = typeIcons[a.type] || { icon: Activity, color: 'text-gray-400', label: a.type }
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                  <div className={`w-9 h-9 rounded-xl bg-dark-700 flex items-center justify-center flex-shrink-0 ${info.color}`}>
                    <info.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{a.user?.name || 'Unknown User'}</span>
                      <span className="text-gray-400"> — {info.label}</span>
                    </p>
                    <p className="text-xs text-gray-500">{a.user?.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {a.score !== undefined && <p className="text-sm font-medium text-primary-400">{a.score}%</p>}
                    <p className="text-xs text-gray-500">{timeAgo(a.createdAt)}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

        </motion.div>
      </main>
    </div>
  )
}