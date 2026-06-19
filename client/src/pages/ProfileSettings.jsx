import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import AnimatedBackground from '../components/AnimatedBackground'
import {
  ArrowLeft, Camera, User, Lock, Trash2, Save, Eye, EyeOff
} from 'lucide-react'

export default function ProfileSettings() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [name, setName] = useState(user?.name || '')
  const [savingName, setSavingName] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const updateLocalUser = (updates) => {
    const updated = { ...user, ...updates }
    localStorage.setItem('careerlunch_user', JSON.stringify(updated))
    setUser(updated)
  }

  const saveName = async () => {
    if (!name.trim() || name.trim().length < 2) return toast.error('Name must be at least 2 characters')
    setSavingName(true)
    try {
      const { data } = await axios.put('http://localhost:5000/api/profile/update', { name },
        { headers: { Authorization: `Bearer ${user.token}` } })
      updateLocalUser({ name: data.user.name })
      toast.success('Name updated!')
    } catch (err) {
      toast.error('Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB')

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const { data } = await axios.post('http://localhost:5000/api/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
      })
      updateLocalUser({ avatar: data.avatar })
      toast.success('Profile picture updated!')
    } catch (err) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const removeAvatar = async () => {
    try {
      await axios.delete('http://localhost:5000/api/profile/avatar', {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      updateLocalUser({ avatar: '' })
      toast.success('Profile picture removed')
    } catch (err) {
      toast.error('Failed to remove image')
    }
  }

  const changePassword = async () => {
    if (passwords.new.length < 6) return toast.error('New password must be at least 6 characters')
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match')

    setChangingPassword(true)
    try {
      await axios.put('http://localhost:5000/api/profile/change-password',
        { currentPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${user.token}` } })
      toast.success('Password changed successfully!')
      setPasswords({ current: '', new: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="min-h-screen bg-dark-900 text-white relative">
      <AnimatedBackground />

      <div className="relative z-10">
        <div className="bg-dark-800/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Profile Settings</h1>
            <p className="text-sm text-gray-400">Manage your account information</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

          {/* Avatar + Name */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-white/5">
            <h2 className="font-semibold mb-5 flex items-center gap-2">
              <User size={18} className="text-primary-400" /> Profile Information
            </h2>

            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover ring-2 ring-primary-400/30" />
                ) : (
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-2xl font-bold ring-2 ring-primary-400/30">
                    {initials}
                  </div>
                )}
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 hover:bg-primary-400 rounded-full flex items-center justify-center border-2 border-dark-900 transition-colors">
                  <Camera size={14} className="text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-2">{uploadingAvatar ? 'Uploading...' : 'JPG, PNG or WEBP. Max 2MB.'}</p>
                {user?.avatar && (
                  <button onClick={removeAvatar} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                    <Trash2 size={12} /> Remove photo
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full bg-dark-700 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-400 text-sm" />
            </div>

            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input value={user?.email} disabled
                className="w-full bg-dark-700/50 border border-white/5 rounded-xl px-4 py-3 text-gray-500 text-sm cursor-not-allowed" />
              <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
            </div>

            <button onClick={saveName} disabled={savingName}
              className="bg-primary-600 hover:bg-primary-400 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2">
              <Save size={16} /> {savingName ? 'Saving...' : 'Save Changes'}
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}