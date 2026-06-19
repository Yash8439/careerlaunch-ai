import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
}, { timestamps: true })

achievementSchema.index({ user: 1, badgeId: 1 }, { unique: true })

export default mongoose.model('Achievement', achievementSchema)