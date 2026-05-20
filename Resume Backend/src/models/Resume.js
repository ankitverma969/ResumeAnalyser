import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  parsedText: {
    type: String,
    required: true,
  },
  atsScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  sectionScores: {
    skills: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    experience: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    education: { type: Number, default: 0 },
  },
  ranking: {
    type: Number,
  },
  interviewProbability: {
    type: Number,
  },
  heatmapData: [{
    section: String,
    importance: Number,
  }],
}, {
  timestamps: true,
});

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
