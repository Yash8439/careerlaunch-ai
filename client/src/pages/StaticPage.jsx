import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, ArrowLeft } from 'lucide-react'

export default function StaticPage({ title, lastUpdated, children }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-900 text-white">

      {/* Navbar */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">CareerLaunch <span className="gradient-text">AI</span></span>
          </Link>
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </nav>

      {/* Content */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {lastUpdated && <p className="text-sm text-gray-500 mb-10">Last updated: {lastUpdated}</p>}
        <div className="prose-content text-gray-300 leading-relaxed space-y-5">
          {children}
        </div>
      </motion.div>

      <footer className="border-t border-white/5 py-6 px-6 text-center text-gray-500 text-sm">
        © 2026 CareerLaunch AI. Made by Yash Rastogi.
      </footer>
    </div>
  )
}