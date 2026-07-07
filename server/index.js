import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import authRoutes from './routes/auth.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import chatRoutes from './routes/chat.routes.js'
import interviewRoutes from './routes/interview.routes.js'
import roadmapRoutes from './routes/roadmap.routes.js'
import questionsRoutes from './routes/questions.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import coachRoutes from './routes/coach.routes.js'
import resourcesRoutes from './routes/resources.routes.js'
import adminRoutes from './routes/admin.routes.js'
import profileRoutes from './routes/profile.routes.js'
import coverLetterRoutes from './routes/coverletter.routes.js'
import companyPrepRoutes from './routes/company-prep.routes.js'
import scheduleRoutes from './routes/schedule.routes.js'
import { startCronJobs } from './utils/cronJobs.js'

const app = express()

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
  ],
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/interview', interviewRoutes)
app.use('/api/roadmap', roadmapRoutes)
app.use('/api/questions', questionsRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/coach', coachRoutes)
app.use('/api/resources', resourcesRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/profile', profileRoutes)
app.use('/api/coverletter', coverLetterRoutes)
app.use('/api/company-prep', companyPrepRoutes)
app.use('/api/schedule', scheduleRoutes)


app.get('/', (req, res) => res.json({ message: 'CareerLaunch AI Backend Running!' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected')
     startCronJobs()
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    )
  })
  .catch(err => console.error('MongoDB Error:', err))