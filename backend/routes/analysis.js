const express = require('express');
const { body, validationResult } = require('express-validator');
const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { analyzeResume } = require('../utils/analysisEngine');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const router = express.Router();

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

    // Perform analysis
    const analysisResult = analyzeResume(
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
    doc.fontSize(20).text('Resume Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Job Role: ${analysis.jobRole}`, { align: 'center' });
    doc.text(`Analyzed: ${analysis.analyzedAt.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // ATS Score
    doc.fontSize(16).text('ATS Score', { underline: true });
    doc.fontSize(48).fillColor(getScoreColor(analysis.atsScore)).text(`${analysis.atsScore}%`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown();

    // Score Meter
    const scoreBarWidth = 400;
    const scoreBarHeight = 20;
    const scoreX = (doc.page.width - scoreBarWidth) / 2;
    doc.rect(scoreX, doc.y, scoreBarWidth, scoreBarHeight).stroke();
    doc.rect(scoreX, doc.y, (scoreBarWidth * analysis.atsScore) / 100, scoreBarHeight)
      .fillColor(getScoreColor(analysis.atsScore)).fill()
      .fillColor('black');
    doc.moveDown(2);

    // Matching Skills
    doc.fontSize(14).text('Matching Skills', { underline: true });
    if (analysis.matchingSkills.length > 0) {
      analysis.matchingSkills.forEach(skill => {
        doc.fontSize(11).text(`• ${skill}`);
      });
    } else {
      doc.fontSize(11).text('No matching skills found');
    }
    doc.moveDown();

    // Missing Skills
    doc.fontSize(14).text('Missing Skills', { underline: true });
    if (analysis.missingSkills.length > 0) {
      analysis.missingSkills.slice(0, 10).forEach(skill => {
        doc.fontSize(11).text(`• ${skill}`);
      });
    } else {
      doc.fontSize(11).text('No missing skills');
    }
    doc.moveDown();

    // Missing Sections
    if (analysis.missingSections.length > 0) {
      doc.fontSize(14).text('Missing Sections', { underline: true });
      analysis.missingSections.forEach(section => {
        doc.fontSize(11).text(`• ${section}`);
      });
      doc.moveDown();
    }

    // Suggestions
    if (analysis.suggestions.length > 0) {
      doc.fontSize(14).text('Suggestions', { underline: true });
      analysis.suggestions.forEach(suggestion => {
        doc.fontSize(11).text(`• ${suggestion}`);
      });
      doc.moveDown();
    }

    // Job Role Fit
    doc.fontSize(14).text('Job Role Fit', { underline: true });
    doc.fontSize(24).fillColor(getScoreColor(analysis.jobRoleFit)).text(`${analysis.jobRoleFit}%`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown();

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
