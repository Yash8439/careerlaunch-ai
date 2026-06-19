import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['DSA', 'OS', 'DBMS', 'OOPS', 'Web Development', 'System Design', 'Interview Experience', 'Company Guide'],
    required: true
  },
  type: { type: String, enum: ['Notes', 'Article', 'Video', 'PDF', 'Practice'], default: 'Article' },
  link: { type: String, required: true },
  tags: [String],
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  views: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Resource', resourceSchema)