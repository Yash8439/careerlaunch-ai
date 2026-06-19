import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import { API_URL } from '../config'
import {
  Users, Activity, BarChart3, BookOpen, Search, Trash2, Ban,
  CheckCircle, LogOut, Shield, Brain, ChevronLeft, ChevronRight
} from 'lucide-react'

const navItems = [
  { icon: BarChart3, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users', active: true },
  { icon: Activity, label: 'Activity Feed', path: '/admin/activity' },
  { icon: BookOpen, label: 'Resources', path: '/admin/resources' },
]

export default function AdminUsers() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [page, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/users?page=${page}&search=${search}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setUsers(data.users)
      setPages(data.pages)
    } catch (err) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (userId) => {
    try {
      const { data } = await axios.patch(`${API_URL}/api/admin/users/${userId}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.isActive } : u))
      toast.success(data.isActive ? 'User activated' : 'User deactivated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status')
    }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setUsers(prev => prev.filter(u => u._id !== userId))
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
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

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Manage Users</h1>
              <p className="text-gray-400">View and manage all registered students</p>
            </div>
          </div>

          <div className="relative mb-6 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search by name or email..."
              className="w-full bg-dark-700 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
          </div>

          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-dark-800/50 text-gray-400 text-left">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Resume Score</th>
                  <th className="px-5 py-3 font-medium">Interviews</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 text-white font-medium">{u.name}</td>
                    <td className="px-5 py-3 text-gray-400">{u.email}</td>
                    <td className="px-5 py-3 text-gray-300">{u.resumeScore}/100</td>
                    <td className="px-5 py-3 text-gray-300">{u.interviewsCompleted}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? 'bg-teal-900/30 text-teal-400' : 'bg-red-900/30 text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleStatus(u._id)}
                          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                          title={u.isActive ? 'Disable user' : 'Enable user'}>
                          {u.isActive ? <Ban size={14} className="text-orange-400" /> : <CheckCircle size={14} className="text-teal-400" />}
                        </button>
                        <button onClick={() => deleteUser(u._id)}
                          className="p-1.5 hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 glass rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-gray-400">Page {page} of {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                className="p-2 glass rounded-lg disabled:opacity-30 hover:bg-white/5 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}

        </motion.div>
      </main>
    </div>
  )
}