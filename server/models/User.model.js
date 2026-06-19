import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: function() { return this.authProvider === 'local' } },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar: { type: String, default: '' },
  resumeScore: { type: Number, default: 0 },
  interviewsCompleted: { type: Number, default: 0 },
  studyStreak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  skills: [String],
  roadmapProgress: { type: Number, default: 0 },
  skillProgress: {
    DSA: { type: Number, default: 0 },
    OS: { type: Number, default: 0 },
    DBMS: { type: Number, default: 0 },
    OOPS: { type: Number, default: 0 },
    WebDev: { type: Number, default: 0 },
  },
  weeklyGoal: { type: Number, default: 10 },
  streakHistory: [{ date: Date, active: Boolean }],
  bookmarkedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],
  isActive: { type: Boolean, default: true },
  resetPasswordToken: { type: String },
resetPasswordExpires: { type: Date },
googleId: { type: String },
authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
}, { timestamps: true })
export default mongoose.model('User', userSchema)