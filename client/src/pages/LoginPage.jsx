import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Eye, EyeOff, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { GoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  try {
    const data = await login(form.email, form.password)
    toast.success('Welcome back!')
    navigate(data.role === 'admin' ? '/admin' : '/dashboard')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Login failed')
  } finally {
    setLoading(false)
  }
}
const handleGoogleSuccess = async (credentialResponse) => {
  setLoading(true)
  try {
    const data = await loginWithGoogle(credentialResponse.credential)
    toast.success('Welcome!')
    navigate(data.role === 'admin' ? '/admin' : '/dashboard')
  } catch (err) {
    toast.error('Google login failed')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 border border-white/10">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">CareerLaunch <span className="gradient-text">AI</span></span>
          </div>

          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8">Login to continue your placement prep</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 transition-colors"
                placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-primary-400 transition-colors"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end mb-5">
  <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
    Forgot Password?
  </Link>
</div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-400 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2">
              {loading ? <><Loader size={18} className="animate-spin" /> Logging in...</> : 'Login'}
            </button>
          </form>

            <div className="flex items-center gap-3 my-5">
  <div className="flex-1 h-px bg-white/10" />
  <span className="text-xs text-gray-500">OR</span>
  <div className="flex-1 h-px bg-white/10" />
</div>

<div className="flex justify-center">
  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google login failed')} theme="filled_black" shape="pill" />
</div>
 <p className="text-center text-gray-400 text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-200 font-medium">
              Register here
            </Link>
          </p>
          
        </div>
      </motion.div>
    </div>
  )
}