const express = require('express');
const { body, validationResult } = require('express-validator');
const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { analyzeResume } = require('../utils/analysisEngine');
const { analyzeResumeAgainstJD } = require('../utils/resumeJdAtsModule');
const { generateAtsFeedback } = require('../services/atsFeedback.service');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const fsp = require('fs').promises;
const { extractResumeText } = require('../utils/pdfParser');

const router = express.Router();

// Multer config for ATS module endpoint (PDF/DOCX/TXT)
const atsStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/ats');
    try {
      await fsp.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `ats-${uniqueSuffix}${ext}`);
  }
});

const atsFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|txt)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file. Only PDF, DOCX, or TXT are allowed.'), false);
  }
};

const atsUpload = multer({
  storage: atsStorage,
  fileFilter: atsFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// @route   POST /api/analysis/ats-module
// @desc    Strict ATS-style Resume–JD analysis (deterministic scoring + AI feedback)
// @access  Private
router.post(
  '/ats-module',
  auth,
  atsUpload.single('resume'),
  [body('jobDescription').notEmpty().withMessage('Job description is required')],
  async (req, res) => {
    let tempPath = null;
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const jobDescription = String(req.body.jobDescription || '');
      let resumeText = String(req.body.resumeText || '');

      if (req.file) {
        tempPath = req.file.path;
        if (req.file.mimetype === 'text/plain' || /\.txt$/i.test(req.file.originalname || '')) {
          resumeText = await fsp.readFile(req.file.path, 'utf8');
        } else {
          const extracted = await extractResumeText(req.file.path, req.file.mimetype);
          resumeText = extracted.text;
        }
      }

      const analysis = await analyzeResumeAgainstJD({
        resumeRawText: resumeText,
        jobDescriptionRawText: jobDescription
      });

      const feedback = await generateAtsFeedback({
        semantic_score: analysis.semantic_score,
        skill_match_percentage: analysis.skill_match_percentage,
        missing_skills: analysis.missing_skills,
        experience_gap: analysis.experience_gap,
        section_score: analysis.section_score,
        candidate_years: analysis.candidate_years,
        required_years: analysis.required_years
      });

      return res.json({
        ats_score: analysis.ats_score,
        semantic_score: analysis.semantic_score,
        skill_match_percentage: analysis.skill_match_percentage,
        experience_score: analysis.experience_score,
        section_score: analysis.section_score,
        matched_skills: analysis.matched_skills,
        missing_skills: analysis.missing_skills,
        candidate_years: analysis.candidate_years,
        required_years: analysis.required_years,
        feedback
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({ message: error.message || 'Error analyzing resume and job description' });
    } finally {
      if (tempPath) {
        try {
          await fsp.unlink(tempPath);
        } catch (_) {}
      }
    }
  }
);

// @route   POST /api/analysis
// @desc    Analyze resume against job description
// @access  Private
router.post('/', auth, [
  body('resumeId').notEmpty().withMessage('Resume ID is required'),
  body('jobRole').notEmpty().withMessage('Job role is required'),
  body('jobDescription').notEmpty().withMessage('Job description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resumeId, jobRole, jobDescription } = req.body;

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Perform analysis (async semantic pipeline)
    const analysisResult = await analyzeResume(
      resume.extractedText,
      resume.parsedData,
      jobDescription,
      jobRole
    );

    // Save analysis to database
    const analysis = new Analysis({
      userId: req.user._id,
      resumeId: resume._id,
      jobRole,
      jobDescription,
      ...analysisResult
    });

    await analysis.save();

    res.json({
      message: 'Analysis completed successfully',
      analysis: {
        id: analysis._id,
        ...analysisResult,
        analyzedAt: analysis.analyzedAt
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Error analyzing resume' });
  }
});

// @route   GET /api/analysis
// @desc    Get all analyses for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .populate('resumeId', 'originalName')
      .sort({ analyzedAt: -1 })
      .limit(50);

    res.json(analyses);
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ message: 'Error fetching analyses' });
  }
});

// @route   GET /api/analysis/:id
// @desc    Get a specific analysis
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('resumeId', 'originalName');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Error fetching analysis' });
  }
});

// @route   GET /api/analysis/:id/download
// @desc    Download analysis report as PDF
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('resumeId', 'originalName');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `resume-analysis-${analysis._id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    // Header
    doc.font('Helvetica-Bold').fontSize(24).text('SkillSync Resume Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica').fontSize(14).text(`Resume: ${analysis.resumeId?.originalName || 'Resume'}`, { align: 'center' });
    doc.fontSize(12).text(`Job Role: ${analysis.jobRole}`, { align: 'center' });
    doc.text(`Analysis Date: ${analysis.analyzedAt.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Executive Summary
    doc.font('Helvetica-Bold').fontSize(18).text('Executive Summary', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`Your resume scored ${analysis.atsScore}% on our ATS compatibility analysis. ` +
      `${analysis.matchingSkills.length} out of ${analysis.matchingSkills.length + analysis.missingSkills.length} ` +
      `key skills from the job description were found in your resume.`, {
      align: 'justify',
      lineGap: 4
    });
    doc.moveDown();

    // ATS Score Section
    doc.font('Helvetica-Bold').fontSize(16).text('ATS Compatibility Score', { underline: true });
    doc.moveDown(0.5);

    // Score Visualization
    const scoreBarWidth = 400;
    const scoreBarHeight = 18;
    const scoreX = (doc.page.width - scoreBarWidth) / 2;
    const scoreY = doc.y;

    // Background bar
    doc.roundedRect(scoreX, scoreY, scoreBarWidth, scoreBarHeight, 4).stroke();
    // Filled bar
    doc.roundedRect(
      scoreX,
      scoreY,
      (scoreBarWidth * analysis.atsScore) / 100,
      scoreBarHeight,
      4
    )
      .fillColor(getScoreColor(analysis.atsScore)).fill()
      .fillColor('black');

    // Score text centered below bar
    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(20).fillColor(getScoreColor(analysis.atsScore))
      .text(`${analysis.atsScore}% ATS Match`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(2);

    // Skills Analysis
    doc.font('Helvetica-Bold').fontSize(16).text('Skills Analysis', { underline: true });
    doc.moveDown(0.5);

    // Matching Skills
    doc.fontSize(14).text('✓ Matching Skills', { underline: true });
    doc.font('Helvetica').fontSize(11);
    if (analysis.matchingSkills.length > 0) {
      analysis.matchingSkills.forEach(skill => {
        doc.text(`• ${skill}`, {
          indent: 10,
          lineGap: 2
        });
      });
    } else {
      doc.text('No matching skills found');
    }
    doc.moveDown();

    // Missing Skills
    doc.fontSize(14).text('✗ Missing Skills', { underline: true });
    doc.font('Helvetica').fontSize(11);
    if (analysis.missingSkills.length > 0) {
      analysis.missingSkills.slice(0, 15).forEach(skill => {
        doc.text(`• ${skill}`, {
          indent: 10,
          lineGap: 2
        });
      });
    } else {
      doc.text('All required skills are present');
    }
    doc.moveDown();

    // Resume Structure Analysis
    doc.font('Helvetica-Bold').fontSize(16).text('Resume Structure Analysis', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(14).text('Missing Sections', { underline: true });
    doc.font('Helvetica').fontSize(11);
    if (analysis.missingSections.length > 0) {
      analysis.missingSections.forEach(section => {
        doc.text(`• ${section}`, {
          indent: 10,
          lineGap: 2
        });
      });
    } else {
      doc.text('All recommended sections are present');
    }
    doc.moveDown();

    // Grammar and Formatting Issues
    if (analysis.grammarIssues && analysis.grammarIssues.length > 0) {
      doc.font('Helvetica-Bold').fontSize(14).text('Grammar & Formatting Issues', { underline: true });
      doc.font('Helvetica').fontSize(11);
      analysis.grammarIssues.slice(0, 10).forEach(issue => {
        doc.text(`• ${issue.text} - ${issue.suggestion}`, {
          indent: 10,
          lineGap: 2
        });
      });
      doc.moveDown();
    }

    // Actionable Recommendations
    doc.font('Helvetica-Bold').fontSize(16).text('Actionable Recommendations', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(11);

    if (analysis.suggestions.length > 0) {
      analysis.suggestions.forEach((suggestion, index) => {
        doc.text(`${index + 1}. ${suggestion}`, {
          indent: 10,
          lineGap: 3
        });
      });
    } else {
      doc.text('Your resume is well-optimized for ATS systems.');
    }
    doc.moveDown();

    // Job Role Compatibility
    doc.font('Helvetica-Bold').fontSize(16).text('Job Role Compatibility', { underline: true });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(12).text(`Compatibility Score: ${analysis.jobRoleFit}%`, { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(11).text(
      `Your background shows ${analysis.jobRoleFit}% compatibility with the ${analysis.jobRole} role. ` +
      'Highlight the most relevant experience, projects, and skills from your resume that directly match the responsibilities and requirements in the job description.',
      {
        align: 'justify',
        lineGap: 4
      }
    );
    doc.moveDown();

    // Footer
    doc.font('Helvetica').fontSize(10).text(
      'Generated by SkillSync - Professional Resume Analysis Platform',
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

function getScoreColor(score) {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

module.exports = router;
