import mongoose from 'mongoose';

const jobDescriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  keywords: [{
    type: String,
  }],
  requiredSkills: [{
    type: String,
  }],
}, {
  timestamps: true,
});

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);

export default JobDescription;
