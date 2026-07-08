import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import Schedule from '../models/Schedule.model.js'
import User from '../models/User.model.js'

const router = express.Router()

// Get all schedules for user
router.get('/', protect, async (req, res) => {
  try {
    const schedules = await Schedule.find({ user: req.user.id })
      .sort({ scheduledAt: 1 })
    res.json({ success: true, schedules })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schedules' })
  }
})

// Create new schedule
router.post('/', protect, async (req, res) => {
  try {
    const { title, company, topic, scheduledAt, notes } = req.body
    if (!title || !topic || !scheduledAt) {
      return res.status(400).json({ message: 'Title, topic and date are required' })
    }

    const schedule = await Schedule.create({
      user: req.user.id,
      title,
      company,
      topic,
      scheduledAt: new Date(scheduledAt),
      notes,
    })

    // Send confirmation email
    const user = await User.findById(req.user.id)
try {
  console.log('Sending email to:', user.email)
  const { sendScheduleEmail } = await import('../utils/sendEmail.js')
  await sendScheduleEmail(user.email, user.name, schedule)
  console.log('Email sent successfully!')
} catch (emailErr) {
  console.error('Email send failed:', emailErr.message)
  console.error('Full error:', emailErr)
}

res.status(201).json({ success: true, schedule })
} catch (err) {
  console.error('Schedule create error:', err)
  res.status(500).json({ message: 'Failed to create schedule' })
}
})

// Update status (complete/cancel)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    )
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' })
    res.json({ success: true, schedule })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update schedule' })
  }
})

// Delete schedule
router.delete('/:id', protect, async (req, res) => {
  try {
    await Schedule.findOneAndDelete({ _id: req.params.id, user: req.user.id })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete schedule' })
  }
})

export default router