import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Brain, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { API_URL } from '../config'
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email })
      setSent(true)
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-600/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10">

        <Link to="/login" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">CareerLaunch <span className="gradient-text">AI</span></span>
        </Link>

        <div className="glass rounded-2xl p-8 border border-white/10">
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
              <p className="text-gray-400 text-sm mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="relative mb-5">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-400 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all duration-200">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4">
              <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-400 text-sm">
                If an account exists with <span className="text-white">{email}</span>, you'll receive a password reset link shortly.
              </p>
            </motion.div>
          )}

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white mt-6 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  )
}