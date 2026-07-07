import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import { API_URL } from '../config'
import {
  ArrowLeft, Calendar, Plus, Clock, Trash2, CheckCircle,
  X, Building2, BookOpen, ChevronRight
} from 'lucide-react'

const topics = ['DSA', 'System Design', 'OS', 'DBMS', 'OOPs', 'Web Development', 'HR Round', 'Full Stack', 'React', 'Node.js']

export default function InterviewScheduler() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', topic: 'DSA', scheduledAt: '', notes: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/schedule`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setSchedules(data.schedules)
    } catch (err) {
      toast.error('Failed to load schedules')
    } finally {
      setLoading(false)
    }
  }

  const createSchedule = async () => {
    if (!form.title || !form.topic || !form.scheduledAt) {
      return toast.error('Title, topic and date/time are required')
    }
    if (new Date(form.scheduledAt) <= new Date()) {
      return toast.error('Please select a future date and time')
    }

    setSubmitting(true)
    try {
      const { data } = await axios.post(`${API_URL}/api/schedule`, form, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setSchedules(prev => [...prev, data.schedule].sort((a, b) =>
        new Date(a.scheduledAt) - new Date(b.scheduledAt)
      ))
      setShowForm(false)
      setForm({ title: '', company: '', topic: 'DSA', scheduledAt: '', notes: '' })
      toast.success('Interview scheduled! Confirmation email sent 📧')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule')
    } finally {
      setSubmitting(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.patch(`${API_URL}/api/schedule/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${user.token}` } }
      )
      setSchedules(prev => prev.map(s => s._id === id ? data.schedule : s))
      toast.success(status === 'completed' ? 'Marked as completed! 🎉' : 'Interview cancelled')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  const deleteSchedule = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/schedule/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setSchedules(prev => prev.filter(s => s._id !== id))
      toast.success('Deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true
    })
  }

  const getTimeUntil = (date) => {
    const diff = new Date(date) - new Date()
    if (diff < 0) return 'Past'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h away`
    if (hours > 0) return `${hours}h ${minutes}m away`
    return `${minutes}m away`
  }

  const upcoming = schedules.filter(s => s.status === 'upcoming')
  const completed = schedules.filter(s => s.status === 'completed')
  const cancelled = schedules.filter(s => s.status === 'cancelled')

  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      <AnimatedBackground />

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <ArrowLeft size={20} className="text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Interview Scheduler</h1>
              <p className="text-sm text-gray-400">Schedule mock interviews with email reminders</p>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-400 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
            <Plus size={16} /> Schedule Interview
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* Schedule Form Modal */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md">

                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold">Schedule Mock Interview</h3>
                    <button onClick={() => setShowForm(false)}>
                      <X size={20} className="text-gray-400 hover:text-white" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Interview Title *</label>
                      <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Amazon SDE Mock Interview"
                        className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Company (Optional)</label>
                      <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })}
                        placeholder="e.g. Amazon, Google, TCS"
                        className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Topic *</label>
                      <select value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                        className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-400 text-sm">
                        {topics.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Date & Time *</label>
                      <input type="datetime-local" value={form.scheduledAt}
                        onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-400 text-sm" />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Notes (Optional)</label>
                      <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                        placeholder="Topics to cover, goals for this session..."
                        rows={2}
                        className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm resize-none" />
                    </div>

                    <div className="bg-dark-700/50 rounded-xl p-3">
                      <p className="text-xs text-gray-400">
                        📧 You'll receive a confirmation email now, and a reminder email 30 minutes before the interview.
                      </p>
                    </div>

                    <button onClick={createSchedule} disabled={submitting}
                      className="w-full bg-primary-600 hover:bg-primary-400 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                      {submitting ? (
                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Scheduling...</>
                      ) : (
                        <><Calendar size={18} /> Schedule & Send Confirmation</>
                      )}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Upcoming', count: upcoming.length, color: 'text-primary-400', bg: 'bg-primary-900/20' },
              { label: 'Completed', count: completed.length, color: 'text-teal-400', bg: 'bg-teal-900/20' },
              { label: 'Cancelled', count: cancelled.length, color: 'text-gray-400', bg: 'bg-dark-700/50' },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} rounded-2xl p-4 text-center border border-white/5`}>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Upcoming Interviews */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock size={18} className="text-primary-400" /> Upcoming Interviews
            </h2>

            {loading ? (
              <div className="glass rounded-2xl p-8 border border-white/5 text-center">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : upcoming.length === 0 ? (
              <div className="glass rounded-2xl p-8 border border-white/5 text-center">
                <Calendar size={40} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No upcoming interviews</p>
                <button onClick={() => setShowForm(true)}
                  className="text-sm text-primary-400 hover:text-primary-300">
                  Schedule your first interview →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((s, i) => (
                  <motion.div key={s._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl p-5 border border-white/5 hover:border-primary-600/20 transition-all">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{s.title}</h3>
                          {s.company && (
                            <span className="text-xs bg-primary-900/30 text-primary-400 px-2 py-0.5 rounded-full border border-primary-700/30">
                              {s.company}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <BookOpen size={13} /> {s.topic}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} /> {formatDate(s.scheduledAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={13} /> {formatTime(s.scheduledAt)}
                          </span>
                        </div>
                        {s.notes && (
                          <p className="text-xs text-gray-500 mt-2">{s.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-primary-400 font-medium bg-primary-900/20 px-2 py-1 rounded-full">
                          {getTimeUntil(s.scheduledAt)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => updateStatus(s._id, 'completed')}
                            title="Mark as completed"
                            className="p-1.5 hover:bg-teal-900/20 rounded-lg transition-colors">
                            <CheckCircle size={16} className="text-teal-400" />
                          </button>
                          <button onClick={() => updateStatus(s._id, 'cancelled')}
                            title="Cancel interview"
                            className="p-1.5 hover:bg-orange-900/20 rounded-lg transition-colors">
                            <X size={16} className="text-orange-400" />
                          </button>
                          <button onClick={() => deleteSchedule(s._id)}
                            title="Delete"
                            className="p-1.5 hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-teal-400" /> Completed
              </h2>
              <div className="space-y-2">
                {completed.map(s => (
                  <div key={s._id} className="glass rounded-xl p-4 border border-white/5 opacity-60 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{s.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(s.scheduledAt)} • {s.topic}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-teal-400 bg-teal-900/20 px-2 py-0.5 rounded-full">Completed</span>
                      <button onClick={() => deleteSchedule(s._id)}
                        className="p-1 hover:bg-red-900/20 rounded-lg transition-colors">
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}