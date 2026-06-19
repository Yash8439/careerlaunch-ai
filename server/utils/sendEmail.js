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