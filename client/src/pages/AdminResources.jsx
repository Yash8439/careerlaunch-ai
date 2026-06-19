import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import { API_URL } from '../config'
import {
  Users, Activity, BarChart3, BookOpen, LogOut, Shield, Brain,
  Plus, Trash2, X
} from 'lucide-react'

const navItems = [
  { icon: BarChart3, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Activity, label: 'Activity Feed', path: '/admin/activity' },
  { icon: BookOpen, label: 'Resources', path: '/admin/resources', active: true },
]

const categories = ['DSA', 'OS', 'DBMS', 'OOPS', 'Web Development', 'System Design', 'Interview Experience', 'Company Guide']

export default function AdminResources() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'DSA', type: 'Article', link: '', difficulty: 'Intermediate', tags: '' })

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/resources`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setResources(data.resources)
    } catch (err) {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const createResource = async () => {
    if (!form.title || !form.link) return toast.error('Title and link are required')
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }
      await axios.post(`${API_URL}/api/admin/resources`, payload, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      toast.success('Resource created!')
      setShowForm(false)
      setForm({ title: '', description: '', category: 'DSA', type: 'Article', link: '', difficulty: 'Intermediate', tags: '' })
      fetchResources()
    } catch (err) {
      toast.error('Failed to create resource')
    }
  }

  const deleteResource = async (id) => {
    if (!window.confirm('Delete this resource?')) return
    try {
      await axios.delete(`${API_URL}/api/admin/resources/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setResources(prev => prev.filter(r => r._id !== id))
      toast.success('Resource deleted')
    } catch (err) {
      toast.error('Failed to delete')
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
              <h1 className="text-3xl font-bold mb-1">Manage Resources</h1>
              <p className="text-gray-400">Add, view, and remove placement resources</p>
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-400 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
              <Plus size={16} /> Add Resource
            </button>
          </div>

          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="glass rounded-2xl p-6 border border-primary-600/30 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">New Resource</h3>
                <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-400" />
                <input placeholder="Link (URL)" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })}
                  className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-400" />
              </div>
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:border-primary-400 resize-none" />
              <div className="grid md:grid-cols-3 gap-3 mb-3">
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  {['Notes', 'Article', 'Video', 'PDF', 'Practice'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                  className="bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <input placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })}
                className="w-full bg-dark-700 border border-white/10 rounded-lg px-3 py-2 text-sm text-white mb-4 focus:outline-none focus:border-primary-400" />
              <button onClick={createResource}
                className="bg-primary-600 hover:bg-primary-400 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all">
                Create Resource
              </button>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : resources.map(r => (
              <div key={r._id} className="glass rounded-xl p-4 border border-white/5 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary-900/30 text-primary-400 px-2 py-0.5 rounded-full">{r.category}</span>
                  </div>
                  <h4 className="text-sm font-medium text-white">{r.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">{r.views || 0} views</p>
                </div>
                <button onClick={() => deleteResource(r._id)}
                  className="p-1.5 hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>

        </motion.div>
      </main>
    </div>
  )
}