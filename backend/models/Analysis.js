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
  feedback: String,
  sectionScore: {
    type: Number,
    min: 0,
    max: 100
  },
  jobRoleFit: {
    type: Number,
    min: 0,
    max: 100
  },
  strengths: [String],
weaknesses: [String],
recruiterTips: [String],

contactInformation: Object,
hardSkills: Object,
softSkills: Object,
searchability: Object,
resumeTone: Object,
educationMatch: Object,
experienceMatch: Object,
jobTitleMatch: Object,
measurableResults: Object,
webPresence: Object,

rewrittenBullets: [Object],

semanticScore: Number,

skillMatchPercentage: Number,

experienceScore: Number,

formattingScore: Number,

keywordOptimizationScore: Number,

leadershipScore: Number,

impactScore: Number,
  analyzedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', analysisSchema);
