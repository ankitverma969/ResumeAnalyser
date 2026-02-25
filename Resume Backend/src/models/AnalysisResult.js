import mongoose from 'mongoose';

const analysisResultSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobDescription',
  },
  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  matchedKeywords: [{
    type: String,
  }],
  missingKeywords: [{
    type: String,
  }],
  recruiterFeedback: {
    type: String,
  },
  heatmapData: [{
    section: String,
    relevance: Number,
  }],
  interviewProbability: {
    type: Number,
  },
  suggestions: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const AnalysisResult = mongoose.model('AnalysisResult', analysisResultSchema);

export default AnalysisResult;
