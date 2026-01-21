const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  extractedText: {
    type: String,
    default: ''
  },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    summary: String,
    skills: [String],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String
    }],
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    projects: [{
      name: String,
      description: String,
      technologies: [String]
    }],
    certifications: [String]
  }
});

module.exports = mongoose.model('Resume', resumeSchema);
