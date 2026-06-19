import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Brain, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    if (password !== confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password })
      setSuccess(true)
      toast.success('Password reset successful!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link invalid or expired')
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
          {!success ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400 text-sm mb-6">Enter your new password below.</p>

              <form onSubmit={handleSubmit}>
                <div className="relative mb-4">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="New password"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl pl-12 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative mb-5">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} required value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password"
                    className="w-full bg-dark-700 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 text-sm" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-primary-600 hover:bg-primary-400 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all duration-200">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4">
              <div className="w-16 h-16 bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-400 text-sm">Redirecting you to login...</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}