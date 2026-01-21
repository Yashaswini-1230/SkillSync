const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  matchingSkills: [String],
  missingSkills: [String],
  missingSections: [String],
  grammarIssues: [{
    text: String,
    suggestion: String,
    severity: String
  }],
  suggestions: [String],
  jobRoleFit: {
    type: Number,
    min: 0,
    max: 100
  },
  analyzedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
