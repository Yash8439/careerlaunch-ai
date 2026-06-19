import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import User from '../models/User.model.js'
import Activity from '../models/Activity.model.js'
import { BADGES } from '../utils/badges.js'
import Achievement from '../models/Achievement.model.js'

const router = express.Router()

// Get full dashboard data
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    const recentActivity = await Activity.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10)

    const totalActivities = await Activity.countDocuments({ user: req.user.id })

    // Calculate streak
    const today = new Date().setHours(0, 0, 0, 0)
    const lastActiveDate = new Date(user.lastActive).setHours(0, 0, 0, 0)
    const daysDiff = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24))

    let currentStreak = user.studyStreak
    if (daysDiff > 1) currentStreak = 0 // streak broken

    res.json({
      success: true,
      stats: {
        resumeScore: user.resumeScore,
        interviewsCompleted: user.interviewsCompleted,
        studyStreak: currentStreak,
        skillProgress: user.skillProgress,
        totalActivities,
        weeklyGoal: user.weeklyGoal,
      },
      recentActivity,
    })
  } catch (err) {
    console.error('Dashboard stats error:', err)
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// Log activity + update streak
router.post('/activity', protect, async (req, res) => {
  try {
    const { type, details, score } = req.body

    await Activity.create({ user: req.user.id, type, details, score })

    const user = await User.findById(req.user.id)
    const today = new Date().setHours(0, 0, 0, 0)
    const lastActiveDate = new Date(user.lastActive).setHours(0, 0, 0, 0)
    const daysDiff = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24))

    let newStreak = user.studyStreak
    if (daysDiff === 1) newStreak += 1
    else if (daysDiff > 1) newStreak = 1
    else if (daysDiff === 0 && user.studyStreak === 0) newStreak = 1

    await User.findByIdAndUpdate(req.user.id, {
      lastActive: new Date(),
      studyStreak: newStreak,
    })

    res.json({ success: true, streak: newStreak })
  } catch (err) {
    res.status(500).json({ message: 'Failed to log activity' })
  }
})

// Update skill progress
router.post('/skill-progress', protect, async (req, res) => {
  try {
    const { skill, increment } = req.body
    const validSkills = ['DSA', 'OS', 'DBMS', 'OOPS', 'WebDev']
    if (!validSkills.includes(skill)) return res.status(400).json({ message: 'Invalid skill' })

    const user = await User.findById(req.user.id)
    const current = user.skillProgress[skill] || 0
    const updated = Math.min(100, current + (increment || 5))

    user.skillProgress[skill] = updated
    await user.save()

    res.json({ success: true, skillProgress: user.skillProgress })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update skill' })
  }
})

// Get resume score history
router.get('/resume-history', protect, async (req, res) => {
  try {
    const history = await Activity.find({
      user: req.user.id,
      type: 'resume_analysis'
    }).sort({ createdAt: 1 }).select('score createdAt details')

    const formatted = history.map(h => ({
      date: new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      score: h.score,
      fullDate: h.createdAt
    }))

    res.json({ success: true, history: formatted })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resume history' })
  }
})

// Get activity heatmap data (last 90 days)
router.get('/heatmap', protect, async (req, res) => {
  try {
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const activities = await Activity.find({
      user: req.user.id,
      createdAt: { $gte: ninetyDaysAgo }
    }).select('createdAt type score')

    // Group by date — count activities per day
    const dayMap = {}
    activities.forEach(a => {
      const dateKey = new Date(a.createdAt).toISOString().split('T')[0]
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { count: 0, types: [] }
      }
      dayMap[dateKey].count += 1
      dayMap[dateKey].types.push(a.type)
    })

    const heatmapData = Object.entries(dayMap).map(([date, data]) => ({
      date,
      count: data.count,
      types: data.types
    }))

    res.json({ success: true, heatmap: heatmapData })
  } catch (err) {
    console.error('Heatmap error:', err)
    res.status(500).json({ message: 'Failed to fetch heatmap data' })
  }
})
// Get achievements with unlock status
router.get('/achievements', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    const resumeAnalysisCount = await Activity.countDocuments({ user: req.user.id, type: 'resume_analysis' })
    const roadmapCount = await Activity.countDocuments({ user: req.user.id, type: 'roadmap_generated' })
    const questionsCount = await Activity.countDocuments({ user: req.user.id, type: 'questions_generated' })
    const chatCount = await Activity.countDocuments({ user: req.user.id, type: 'chat_message' })

    const stats = {
      resumeScore: user.resumeScore,
      interviewsCompleted: user.interviewsCompleted,
      studyStreak: user.studyStreak,
      resumeAnalysisCount,
      roadmapCount,
      questionsCount,
      chatCount,
    }

    const unlockedDocs = await Achievement.find({ user: req.user.id })
    const unlockedIds = new Set(unlockedDocs.map(a => a.badgeId))

    // Check for newly unlocked badges
    for (const badge of BADGES) {
      if (!unlockedIds.has(badge.id) && badge.condition(stats)) {
        await Achievement.create({ user: req.user.id, badgeId: badge.id })
        unlockedIds.add(badge.id)
      }
    }

    const achievements = BADGES.map(b => ({
      ...b,
      condition: undefined,
      unlocked: unlockedIds.has(b.id),
    }))

    res.json({ success: true, achievements, unlockedCount: unlockedIds.size, totalCount: BADGES.length })
  } catch (err) {
    console.error('Achievements error:', err)
    res.status(500).json({ message: 'Failed to fetch achievements' })
  }
})

export default router