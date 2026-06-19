import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import TiltCard from '../components/TiltCard'
import {
  Users, Activity, FileText, Mic, TrendingUp, LogOut,
  Shield, BarChart3, BookOpen, Search, Trash2, Ban, CheckCircle,
  Brain
} from 'lucide-react'

const navItems = [
  { icon: BarChart3, label: 'Overview', path: '/admin', active: true },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Activity, label: 'Activity Feed', path: '/admin/activity' },
  { icon: BookOpen, label: 'Resources', path: '/admin/resources' },
]

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [usersByDay, setUsersByDay] = useState([])
  const [activityByType, setActivityByType] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setStats(data.stats)
      setUsersByDay(data.usersByDay)
      setActivityByType(data.activityByType)
    } catch (err) {
      toast.error('Failed to load admin stats')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const maxDayCount = Math.max(...usersByDay.map(d => d.count), 1)

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-primary-400', bg: 'bg-primary-900/30' },
    { label: 'Active This Week', value: stats?.activeUsersThisWeek || 0, icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-900/30' },
    { label: 'Resume Analyses', value: stats?.resumeAnalyses || 0, icon: FileText, color: 'text-orange-400', bg: 'bg-orange-900/30' },
    { label: 'Mock Interviews', value: stats?.mockInterviews || 0, icon: Mic, color: 'text-blue-400', bg: 'bg-blue-900/30' },
  ]

  return (
    <div className="min-h-screen bg-dark-900 flex relative">
      <AnimatedBackground />

      {/* Sidebar */}
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
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${item.active
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }`}>
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-red-400/30">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-red-400">Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1 flex items-center gap-3">
              Admin Overview <Shield size={24} className="text-red-400" />
            </h1>
            <p className="text-gray-400">Platform-wide analytics and management</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <TiltCard className="glass rounded-2xl p-5 border border-white/5">
                  <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3 relative z-10`}>
                    <s.icon size={20} className={s.color} />
                  </div>
                  <div className="text-2xl font-bold text-white relative z-10">{loading ? '...' : s.value}</div>
                  <div className="text-sm text-gray-400 mt-1 relative z-10">{s.label}</div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">

            {/* User Growth Chart */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold mb-5">User Growth (Last 30 Days)</h2>
              {usersByDay.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-12">No signup data yet</p>
              ) : (
                <div className="flex items-end gap-1 h-48">
                  {usersByDay.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white bg-dark-700 px-2 py-1 rounded">
                        {d.count}
                      </div>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.count / maxDayCount) * 100}%` }}
                        transition={{ delay: i * 0.02 }}
                        className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-sm min-h-[2px]" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Breakdown */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-semibold mb-5">Activity Breakdown</h2>
              {activityByType.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {activityByType.map((a, i) => {
                    const total = activityByType.reduce((sum, x) => sum + x.count, 0)
                    const pct = Math.round((a.count / total) * 100)
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300 capitalize">{a._id.replace(/_/g, ' ')}</span>
                          <span className="text-gray-500">{a.count}</span>
                        </div>
                        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                            className="h-full bg-primary-500 rounded-full" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5 border border-white/5">
              <p className="text-sm text-gray-400 mb-1">New Users This Week</p>
              <p className="text-2xl font-bold text-teal-400">+{stats?.newUsersThisWeek || 0}</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/5">
              <p className="text-sm text-gray-400 mb-1">Average Resume Score</p>
              <p className="text-2xl font-bold text-primary-400">{stats?.avgResumeScore || 0}/100</p>
            </div>
            <div className="glass rounded-2xl p-5 border border-white/5">
              <p className="text-sm text-gray-400 mb-1">Total Resources</p>
              <p className="text-2xl font-bold text-orange-400">{stats?.totalResources || 0}</p>
            </div>
          </div>

        </motion.div>
      </main>
    </div>
  )
}