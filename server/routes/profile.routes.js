import express from 'express'
import multer from 'multer'
import { protect } from '../middleware/auth.middleware.js'
import User from '../models/User.model.js'

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP allowed'))
  }
})

// Update name
router.put('/update', protect, async (req, res) => {
  try {
    const { name } = req.body
    if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters' })

    const user = await User.findByIdAndUpdate(req.user.id, { name: name.trim() }, { new: true }).select('-password')
    res.json({ success: true, user })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

// Upload avatar (stored as base64 in DB for simplicity)
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' })

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: base64 }, { new: true }).select('-password')

    res.json({ success: true, avatar: user.avatar })
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload avatar' })
  }
})

// Remove avatar
router.delete('/avatar', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { avatar: '' })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove avatar' })
  }
})

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!newPassword || newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' })

    const bcrypt = await import('bcryptjs')
    const user = await User.findById(req.user.id)

    const match = await bcrypt.default.compare(currentPassword, user.password)
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' })

    user.password = await bcrypt.default.hash(newPassword, 12)
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password' })
  }
})

export default router