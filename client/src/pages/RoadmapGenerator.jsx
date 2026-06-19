import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, Map, Sparkles, Calendar, Target,
  BookOpen, Code, CheckCircle2, ChevronDown, ChevronUp, Download
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
import { API_URL } from '../config'

const roleOptions = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Android Developer', 'Data Analyst', 'Data Scientist', 'AI/ML Engineer', 'DevOps Engineer'
]

const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Recent Graduate']

const WeekCard = ({ week, index, isOpen, onToggle }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="glass rounded-2xl border border-white/5 overflow-hidden mb-3">
    <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-primary-900/50 rounded-xl flex items-center justify-center font-bold text-primary-400 flex-shrink-0">
          {week.weekNumber}
        </div>
        <div>
          <h3 className="font-semibold text-white">{week.title}</h3>
          <p className="text-xs text-gray-400">{week.focus}</p>
        </div>
      </div>
      {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
    </button>

    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="px-5 pb-5 pt-1 border-t border-white/5">

            <div className="mb-4">
              <p className="text-xs text-gray-500 font-medium mb-2">TOPICS TO COVER</p>
              <div className="flex flex-wrap gap-2">
                {week.topics?.map((t, i) => (
                  <span key={i} className="text-xs bg-primary-900/30 text-primary-300 px-3 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-500 font-medium mb-2">TASKS</p>
              <div className="space-y-2">
                {week.tasks?.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <CheckCircle2 size={14} className="text-teal-400 mt-0.5 flex-shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {week.project && (
              <div className="mb-4 bg-dark-700/50 rounded-xl p-3">
                <p className="text-xs text-yellow-400 font-medium mb-1 flex items-center gap-1">
                  <Code size={12} /> PROJECT
                </p>
                <p className="text-sm text-gray-300">{week.project}</p>
              </div>
            )}

            {week.resources?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 font-medium mb-2">RESOURCES</p>
                <div className="space-y-1">
                  {week.resources.map((r, i) => (
                    <p key={i} className="text-xs text-gray-400">📚 {r}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
)

export default function RoadmapGenerator() {
  const [form, setForm] = useState({ year: '', targetRole: '', currentSkills: '', weeklyHours: '15', goal: '' })
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)
  const [openWeek, setOpenWeek] = useState(0)
  const { user } = useAuth()
  const navigate = useNavigate()

  const generate = async () => {
    if (!form.targetRole) return toast.error('Please select target role')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_URL}/api/roadmap/generate`, form, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setRoadmap(data.roadmap)
      toast.success('Your personalized roadmap is ready!')
    } catch (err) {
      toast.error('Failed to generate roadmap')
    } finally {
      setLoading(false)
    }
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
            <Map size={20} className="text-primary-400" /> Roadmap Generator
          </h1>
          <p className="text-xs text-gray-400">Personalized 8-week placement preparation plan</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {!roadmap ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={32} className="text-primary-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Build Your Roadmap</h2>
              <p className="text-gray-400">Tell us about yourself and goals</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/5 space-y-5">

              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {roleOptions.map(r => (
                    <button key={r} onClick={() => setForm({ ...form, targetRole: r })}
                      className={`text-sm p-3 rounded-xl border text-left transition-all
                        ${form.targetRole === r ? 'border-primary-400 bg-primary-900/30 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Year</label>
                <div className="flex flex-wrap gap-2">
                  {yearOptions.map(y => (
                    <button key={y} onClick={() => setForm({ ...form, year: y })}
                      className={`text-xs px-4 py-2 rounded-full border transition-all
                        ${form.year === y ? 'border-primary-400 bg-primary-900/30 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Skills (comma separated)</label>
                <input value={form.currentSkills} onChange={e => setForm({ ...form, currentSkills: e.target.value })}
                  placeholder="e.g. HTML, CSS, basic JavaScript"
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Weekly Study Hours Available</label>
                <input type="number" value={form.weeklyHours} onChange={e => setForm({ ...form, weeklyHours: e.target.value })}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 text-sm" />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Specific Goal (optional)</label>
                <textarea value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}
                  placeholder="e.g. Want to crack product-based companies in 3 months"
                  rows={2}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm resize-none" />
              </div>

              <button onClick={generate} disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-400 disabled:opacity-50 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                {loading ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating your roadmap...</>
                ) : (
                  <><Sparkles size={20} /> Generate Roadmap</>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Overview */}
            <div className="glass rounded-2xl p-6 mb-6 border border-primary-600/20">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl font-bold">{form.targetRole} Roadmap</h2>
                  <p className="text-gray-400 text-sm mt-1">{roadmap.roleOverview}</p>
                </div>
                <div className="text-center flex-shrink-0 ml-4">
                  <div className="text-2xl font-bold text-teal-400">{roadmap.estimatedReadiness}</div>
                  <div className="text-xs text-gray-500">Est. Readiness</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 mt-4">
                <span className="flex items-center gap-1"><Calendar size={14} /> {roadmap.totalWeeks} weeks</span>
                <span className="flex items-center gap-1"><Target size={14} /> {form.weeklyHours}h/week</span>
              </div>
            </div>

            {/* Skills to learn */}
            <div className="glass rounded-2xl p-5 mb-6 border border-white/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><BookOpen size={16} className="text-primary-400" /> Skills to Master</h3>
              <div className="flex flex-wrap gap-2">
                {roadmap.skillsToLearn?.map((s, i) => (
                  <span key={i} className="text-sm bg-teal-900/30 text-teal-300 px-3 py-1.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Weekly breakdown */}
            <h3 className="font-semibold mb-4 text-lg">Week-by-Week Plan</h3>
            {roadmap.weeks?.map((week, i) => (
              <WeekCard key={i} week={week} index={i} isOpen={openWeek === i} onToggle={() => setOpenWeek(openWeek === i ? -1 : i)} />
            ))}

            {/* Tips */}
            <div className="glass rounded-2xl p-5 mt-6 border border-yellow-700/20">
              <h3 className="font-semibold mb-3 text-yellow-400">💡 Interview Prep Tips</h3>
              {roadmap.interviewPrepTips?.map((t, i) => (
                <p key={i} className="text-sm text-gray-300 mb-1">• {t}</p>
              ))}
            </div>

            <button onClick={() => setRoadmap(null)}
              className="w-full mt-6 glass border border-white/10 hover:border-primary-600/50 text-white py-3 rounded-xl font-medium transition-all">
              Generate New Roadmap
            </button>
          </motion.div>
        )}
      </div>
    </div>
    </div>
  )
}