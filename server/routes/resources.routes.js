import express from 'express'
import { protect } from '../middleware/auth.middleware.js'
import Resource from '../models/Resource.model.js'
import User from '../models/User.model.js'

const router = express.Router()

// Get all resources with filters
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, difficulty } = req.query
    let query = {}

    if (category && category !== 'All') query.category = category
    if (difficulty) query.difficulty = difficulty
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 })
    const user = await User.findById(req.user.id).select('bookmarkedResources')

    const resourcesWithBookmark = resources.map(r => ({
      ...r.toObject(),
      isBookmarked: user.bookmarkedResources.some(id => id.toString() === r._id.toString())
    }))

    res.json({ success: true, resources: resourcesWithBookmark })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resources' })
  }
})

// Get bookmarked resources
router.get('/bookmarks', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('bookmarkedResources')
    res.json({ success: true, resources: user.bookmarkedResources })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookmarks' })
  }
})

// Toggle bookmark
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    const resourceId = req.params.id
    const index = user.bookmarkedResources.findIndex(id => id.toString() === resourceId)

    let bookmarked
    if (index > -1) {
      user.bookmarkedResources.splice(index, 1)
      bookmarked = false
    } else {
      user.bookmarkedResources.push(resourceId)
      bookmarked = true
    }
    await user.save()

    res.json({ success: true, bookmarked })
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle bookmark' })
  }
})

// Track view + redirect info
router.post('/:id/view', protect, async (req, res) => {
  try {
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to track view' })
  }
})

// Seed initial resources (run once)
router.post('/seed', async (req, res) => {
  try {
    const count = await Resource.countDocuments()
    if (count > 0) return res.json({ message: 'Resources already seeded', count })

    const resources = [
      { title: 'Striver\'s SDE Sheet', description: 'Most popular DSA sheet covering all important topics for placements', category: 'DSA', type: 'Practice', link: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', tags: ['DSA', 'Arrays', 'Trees', 'Graphs'], difficulty: 'Intermediate' },
      { title: 'Operating System Notes - Gate Smashers', description: 'Complete OS concepts: Process, Threads, Deadlock, Memory Management', category: 'OS', type: 'Video', link: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', tags: ['OS', 'Deadlock', 'Process'], difficulty: 'Beginner' },
      { title: 'DBMS Complete Course', description: 'Normalization, SQL Queries, Transactions, Indexing explained', category: 'DBMS', type: 'Video', link: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiHGhOHV-nwb0HR5US5GFKFI', tags: ['DBMS', 'SQL', 'Normalization'], difficulty: 'Intermediate' },
      { title: 'OOPS Concepts in Java', description: 'Inheritance, Polymorphism, Encapsulation, Abstraction with examples', category: 'OOPS', type: 'Article', link: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/', tags: ['OOPS', 'Java'], difficulty: 'Beginner' },
      { title: 'System Design Primer', description: 'Learn how to design large-scale systems for interviews', category: 'System Design', type: 'Notes', link: 'https://github.com/donnemartin/system-design-primer', tags: ['System Design', 'Scalability'], difficulty: 'Advanced' },
      { title: 'Full Stack Roadmap 2025', description: 'Complete guide to becoming a full stack developer', category: 'Web Development', type: 'Article', link: 'https://roadmap.sh/full-stack', tags: ['React', 'Node', 'Full Stack'], difficulty: 'Beginner' },
      { title: 'Amazon SDE Interview Experience', description: 'Detailed interview experience for SDE-1 role at Amazon', category: 'Interview Experience', type: 'Article', link: 'https://www.geeksforgeeks.org/amazon-interview-experience/', tags: ['Amazon', 'SDE'], difficulty: 'Intermediate' },
      { title: 'Google Interview Preparation Guide', description: 'How to prepare for Google interviews — DSA + System Design', category: 'Company Guide', type: 'Article', link: 'https://www.geeksforgeeks.org/how-to-prepare-for-google-interview/', tags: ['Google', 'FAANG'], difficulty: 'Advanced' },
      { title: 'JavaScript Interview Questions', description: 'Top 50 JS interview questions with detailed answers', category: 'Web Development', type: 'Notes', link: 'https://github.com/sudheerj/javascript-interview-questions', tags: ['JavaScript', 'Frontend'], difficulty: 'Intermediate' },
      { title: 'Computer Networks Notes', description: 'OSI model, TCP/IP, HTTP, DNS explained simply', category: 'OS', type: 'Notes', link: 'https://www.geeksforgeeks.org/computer-network-tutorials/', tags: ['Networks', 'TCP/IP'], difficulty: 'Intermediate' },
      { title: 'LeetCode Top 150 Problems', description: 'Curated list of most asked coding interview problems', category: 'DSA', type: 'Practice', link: 'https://leetcode.com/studyplan/top-interview-150/', tags: ['DSA', 'LeetCode'], difficulty: 'Advanced' },
      { title: 'SQL Practice Problems', description: 'Hands-on SQL query practice for interviews', category: 'DBMS', type: 'Practice', link: 'https://www.hackerrank.com/domains/sql', tags: ['SQL', 'Practice'], difficulty: 'Intermediate' },
    ]

    await Resource.insertMany(resources)
    res.json({ success: true, message: 'Resources seeded successfully', count: resources.length })
  } catch (err) {
    res.status(500).json({ message: 'Failed to seed resources', error: err.message })
  }
})

export default router