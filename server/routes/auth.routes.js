import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import { protect } from '../middleware/auth.middleware.js'
import crypto from 'crypto'
import { sendResetEmail } from '../utils/sendEmail.js'
import { OAuth2Client } from 'google-auth-library'
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const router = express.Router()

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, password: hashed })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })

    res.json({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  resumeScore: user.resumeScore,
  interviewsCompleted: user.interviewsCompleted,
  studyStreak: user.studyStreak,
  token: generateToken(user._id),
})
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})
// Forgot Password - send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000 // 15 minutes
    await user.save()

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    await sendResetEmail(user.email, resetLink)

    res.json({ success: true, message: 'If that email exists, a reset link has been sent' })
  } catch (err) {
    console.error('Forgot password error:', err)
    res.status(500).json({ message: 'Failed to send reset email' })
  }
})

// Reset Password - verify token and set new password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })
    }

    user.password = await bcrypt.hash(password, 12)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ success: true, message: 'Password reset successful' })
  } catch (err) {
    console.error('Reset password error:', err)
    res.status(500).json({ message: 'Failed to reset password' })
  }
})
// Google OAuth Login/Register
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    const { email, name, picture, sub: googleId } = payload

    let user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId,
        authProvider: 'google',
        avatar: picture,
      })
    } else if (!user.googleId) {
      user.googleId = googleId
      user.authProvider = 'google'
      if (!user.avatar) user.avatar = picture
      await user.save()
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      resumeScore: user.resumeScore,
      interviewsCompleted: user.interviewsCompleted,
      studyStreak: user.studyStreak,
      token: generateToken(user._id),
    })
  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ message: 'Google authentication failed' })
  }
})

export default router