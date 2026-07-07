import mongoose from 'mongoose'

const scheduleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, default: '' },
  topic: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  reminderSent: { type: Boolean, default: false },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  notes: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.model('Schedule', scheduleSchema)