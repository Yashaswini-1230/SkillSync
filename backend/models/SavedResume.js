const mongoose = require('mongoose');

const savedResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  template: {
    type: String,
    required: true,
    enum: ['modern-professional', 'minimal-tech', 'classic-ats', 'two-column-professional', 'creative', 'compact-fresher', 'executive']
  },
  resumeData: {
    personalInfo: {
      name: String,
      email: String,
      phone: String,
      address: String,
      linkedin: String,
      github: String
    },
    summary: String,
    skills: {
      technical: [String],
      soft: [String]
    },
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      startYear: String,
      endYear: String,
      gpa: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      startMonth: String,
      startYear: String,
      endMonth: String,
      endYear: String,
      isPresent: Boolean
    }],
    certifications: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
savedResumeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SavedResume', savedResumeSchema);