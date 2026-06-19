import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import {
  ArrowLeft, BookOpen, Search, Bookmark, BookmarkCheck,
  ExternalLink, Eye, Filter, Video, FileText, Code, Notebook
} from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
import { API_URL } from '../config'

const categories = ['All', 'DSA', 'OS', 'DBMS', 'OOPS', 'Web Development', 'System Design', 'Interview Experience', 'Company Guide']

const typeIcons = {
  Notes: Notebook, Article: FileText, Video: Video, PDF: FileText, Practice: Code
}

const difficultyColors = {
  Beginner: 'text-green-400 bg-green-900/20',
  Intermediate: 'text-yellow-400 bg-yellow-900/20',
  Advanced: 'text-red-400 bg-red-900/20'
}

export default function ResourceHub() {
  const [resources, setResources] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showBookmarks, setShowBookmarks] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchResources()
  }, [category, search, showBookmarks])

  const fetchResources = async () => {
    setLoading(true)
    try {
      if (showBookmarks) {
        const { data } = await axios.get(`${API_URL}/api/resources/bookmarks`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setResources(data.resources.map(r => ({ ...r, isBookmarked: true })))
      } else {
        const params = new URLSearchParams()
        if (category !== 'All') params.append('category', category)
        if (search) params.append('search', search)

        const { data } = await axios.get(`${API_URL}/api/resources?${params}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
        setResources(data.resources)
      }
    } catch (err) {
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (id) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/resources/${id}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      setResources(prev =>
        showBookmarks && !data.bookmarked
          ? prev.filter(r => r._id !== id)
          : prev.map(r => r._id === id ? { ...r, isBookmarked: data.bookmarked } : r)
      )
      toast.success(data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks')
    } catch (err) {
      toast.error('Failed to update bookmark')
    }
  }

  const openResource = async (resource) => {
    try {
      await axios.post(`${API_URL}/api/resources/${resource._id}/view`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
    } catch { }
    window.open(resource.link, '_blank')
  }

return (
  <div className="min-h-screen bg-dark-900 text-white relative">
    <AnimatedBackground />

    <div className="relative z-10">
    <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-primary-400" /> Placement Resource Hub
          </h1>
          <p className="text-xs text-gray-400">Curated notes, guides & interview experiences</p>
        </div>
        <button onClick={() => setShowBookmarks(!showBookmarks)}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-all
            ${showBookmarks ? 'bg-primary-600 text-white' : 'bg-dark-700 text-gray-400 hover:text-white'}`}>
          <Bookmark size={16} /> My Bookmarks
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {!showBookmarks && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search resources by topic, tag, or keyword..."
                className="w-full bg-dark-700 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`text-sm px-4 py-2 rounded-full border transition-all
                    ${category === c ? 'border-primary-400 bg-primary-900/30 text-white' : 'border-white/10 text-gray-400 hover:border-white/20'}`}>
                  {c}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Resources Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-white/5 h-40 animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">
              {showBookmarks ? 'No bookmarks yet. Start saving resources!' : 'No resources found. Try a different search.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {resources.map((r, i) => {
                const TypeIcon = typeIcons[r.type] || FileText
                return (
                  <motion.div key={r._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-2xl p-5 border border-white/5 hover:border-primary-600/30 transition-all duration-200 flex flex-col">

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-900/30 rounded-lg flex items-center justify-center">
                          <TypeIcon size={14} className="text-primary-400" />
                        </div>
                        <span className="text-xs text-gray-500">{r.category}</span>
                      </div>
                      <button onClick={() => toggleBookmark(r._id)}
                        className="text-gray-500 hover:text-primary-400 transition-colors">
                        {r.isBookmarked ? <BookmarkCheck size={18} className="text-primary-400" /> : <Bookmark size={18} />}
                      </button>
                    </div>

                    <h3 className="font-semibold text-white mb-1.5 leading-snug">{r.title}</h3>
                    <p className="text-xs text-gray-400 mb-3 leading-relaxed flex-1">{r.description}</p>

                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColors[r.difficulty]}`}>
                        {r.difficulty}
                      </span>
                      {r.tags?.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-xs bg-dark-700 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Eye size={12} /> {r.views || 0} views
                      </span>
                      <button onClick={() => openResource(r)}
                        className="flex items-center gap-1.5 text-xs bg-primary-600 hover:bg-primary-400 text-white px-3 py-1.5 rounded-lg transition-colors">
                        Open <ExternalLink size={12} />
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}