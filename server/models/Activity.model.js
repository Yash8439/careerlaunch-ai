import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['resume_analysis', 'mock_interview', 'roadmap_generated', 'chat_session', 'questions_generated'],
    required: true
  },
  details: { type: mongoose.Schema.Types.Mixed },
  score: { type: Number },
}, { timestamps: true })

export default mongoose.model('Activity', activitySchema)