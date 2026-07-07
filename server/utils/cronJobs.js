import cron from 'node-cron'
import Schedule from '../models/Schedule.model.js'
import User from '../models/User.model.js'
import { sendReminderEmail } from './sendEmail.js'

export const startCronJobs = () => {
  // Har 5 minute mein check karo upcoming interviews
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date()
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000)
      const thirtyFiveMinutesLater = new Date(now.getTime() + 35 * 60 * 1000)

      // Find interviews jo 30-35 min mein hone wale hain aur reminder nahi gaya
      const upcomingInterviews = await Schedule.find({
        status: 'upcoming',
        reminderSent: false,
        scheduledAt: {
          $gte: thirtyMinutesLater,
          $lte: thirtyFiveMinutesLater
        }
      }).populate('user', 'name email')

      for (const schedule of upcomingInterviews) {
        if (schedule.user?.email) {
          await sendReminderEmail(schedule.user.email, schedule.user.name, schedule)
          schedule.reminderSent = true
          await schedule.save()
          console.log(`Reminder sent to ${schedule.user.email} for: ${schedule.title}`)
        }
      }
    } catch (err) {
      console.error('Cron job error:', err)
    }
  })

  console.log('✅ Cron jobs started — checking reminders every 5 minutes')
}