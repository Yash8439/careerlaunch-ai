import express from 'express'
import { protect, adminOnly } from '../middleware/auth.middleware.js'
import User from '../models/User.model.js'
import Activity from '../models/Activity.model.js'
import Resource from '../models/Resource.model.js'

const router = express.Router()

// Get platform-wide stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalActivities = await Activity.countDocuments()
    const totalResources = await Resource.countDocuments()

    const resumeAnalyses = await Activity.countDocuments({ type: 'resume_analysis' })
    const mockInterviews = await Activity.countDocuments({ type: 'mock_interview' })

    const avgResumeScore = await User.aggregate([
      { $match: { resumeScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$resumeScore' } } }
    ])

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    const activeUsersThisWeek = await User.countDocuments({ lastActive: { $gte: sevenDaysAgo } })

    const usersByDay = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ])

    const activityByType = await Activity.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ])

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalActivities,
        totalResources,
        resumeAnalyses,
        mockInterviews,
        avgResumeScore: avgResumeScore[0]?.avg ? Math.round(avgResumeScore[0].avg) : 0,
        newUsersThisWeek,
        activeUsersThisWeek,
      },
      usersByDay,
      activityByType,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ message: 'Failed to fetch admin stats' })
  }
})

// Get all users with pagination
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {}

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await User.countDocuments(query)

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' })
  }
})

// Toggle user active status
router.patch('/users/:id/toggle-status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot modify admin accounts' })

    user.isActive = !user.isActive
    await user.save()
    res.json({ success: true, isActive: user.isActive })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update user status' })
  }
})

// Delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts' })

    await User.findByIdAndDelete(req.params.id)
    await Activity.deleteMany({ user: req.params.id })
    res.json({ success: true, message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' })
  }
})

// Get recent activity across all users
router.get('/activity', protect, adminOnly, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
    res.json({ success: true, activities })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity' })
  }
})

// Resource management — Create
router.post('/resources', protect, adminOnly, async (req, res) => {
  try {
    const resource = await Resource.create(req.body)
    res.status(201).json({ success: true, resource })
  } catch (err) {
    res.status(500).json({ message: 'Failed to create resource', error: err.message })
  }
})

// Resource management — Update
router.put('/resources/:id', protect, adminOnly, async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ success: true, resource })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update resource' })
  }
})

// Resource management — Delete
router.delete('/resources/:id', protect, adminOnly, async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id)
    res.json({ success: true, message: 'Resource deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete resource' })
  }
})

export default router