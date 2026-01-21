const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { extractResumeText } = require('../utils/pdfParser');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/resumes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @route   POST /api/resumes/upload
// @desc    Upload a resume
// @access  Private
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Extract text from resume
    const { text, parsedData } = await extractResumeText(req.file.path, req.file.mimetype);

    // Save resume to database
    const resume = new Resume({
      userId: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      extractedText: text,
      parsedData
    });

    await resume.save();

    res.status(201).json({
      message: 'Resume uploaded successfully',
      resume: {
        id: resume._id,
        fileName: resume.fileName,
        originalName: resume.originalName,
        uploadedAt: resume.uploadedAt,
        parsedData: resume.parsedData
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({ message: error.message || 'Error uploading resume' });
  }
});

// @route   GET /api/resumes
// @desc    Get all resumes for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ uploadedAt: -1 })
      .select('-extractedText');

    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ message: 'Error fetching resumes' });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get a specific resume
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Error fetching resume' });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete a resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(resume.filePath);
    } catch (unlinkError) {
      console.error('Error deleting file:', unlinkError);
    }

    // Delete from database
    await Resume.findByIdAndDelete(req.params.id);

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Error deleting resume' });
  }
});

module.exports = router;
