import dotenv from 'dotenv'
dotenv.config()
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export const sendResetEmail = async (to, resetLink) => {
  await transporter.sendMail({
    from: `"CareerLaunch AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password — CareerLaunch AI',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7F77DD;">Reset Your Password</h2>
        <p style="color: #444; line-height: 1.6;">
          We received a request to reset your password for your CareerLaunch AI account.
          Click the button below to set a new password. This link expires in 15 minutes.
        </p>
        <a href="${resetLink}"
          style="display: inline-block; background: #7F77DD; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #888; font-size: 13px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  })
}
export const sendScheduleEmail = async (to, name, schedule) => {
  const date = new Date(schedule.scheduledAt)
  const formattedDate = date.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  })

  await transporter.sendMail({
    from: `"CareerLaunch AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Interview Scheduled: ${schedule.title} — CareerLaunch AI`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #7F77DD;">Interview Scheduled! 📅</h2>
        <p>Hi ${name},</p>
        <p>Your mock interview has been scheduled successfully.</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Title:</strong> ${schedule.title}</p>
          <p><strong>Topic:</strong> ${schedule.topic}</p>
          ${schedule.company ? `<p><strong>Company:</strong> ${schedule.company}</p>` : ''}
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Time:</strong> ${formattedTime}</p>
        </div>
        <p>You'll receive a reminder 30 minutes before your scheduled interview.</p>
        <p style="color: #888; font-size: 13px;">Good luck with your preparation! 🚀</p>
      </div>
    `,
  })
}

export const sendReminderEmail = async (to, name, schedule) => {
  const date = new Date(schedule.scheduledAt)
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  })

  await transporter.sendMail({
    from: `"CareerLaunch AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⏰ Reminder: Your interview starts in 30 minutes!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1D9E75;">Interview Starting Soon! ⏰</h2>
        <p>Hi ${name},</p>
        <p>Your mock interview <strong>${schedule.title}</strong> starts in <strong>30 minutes</strong> at ${formattedTime}.</p>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Topic:</strong> ${schedule.topic}</p>
          ${schedule.company ? `<p><strong>Company Focus:</strong> ${schedule.company}</p>` : ''}
        </div>
        <a href="${process.env.CLIENT_URL}/interview"
          style="display: inline-block; background: #7F77DD; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Start Interview Now
        </a>
        <p style="color: #888; font-size: 13px; margin-top: 16px;">You've got this! 💪</p>
      </div>
    `,
  })
}