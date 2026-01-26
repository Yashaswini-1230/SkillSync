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
    doc.fontSize(24).text('SkillSync Resume Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Resume: ${analysis.resumeId?.originalName || 'Resume'}`, { align: 'center' });
    doc.fontSize(12).text(`Job Role: ${analysis.jobRole}`, { align: 'center' });
    doc.text(`Analysis Date: ${analysis.analyzedAt.toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Executive Summary
    doc.fontSize(18).text('Executive Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Your resume scored ${analysis.atsScore}% on our ATS compatibility analysis. ` +
      `${analysis.matchingSkills.length} out of ${analysis.matchingSkills.length + analysis.missingSkills.length} ` +
      `key skills from the job description were found in your resume.`, {
      align: 'justify'
    });
    doc.moveDown();

    // ATS Score Section
    doc.fontSize(16).text('ATS Compatibility Score', { underline: true });
    doc.moveDown(0.5);

    // Score Visualization
    const scoreBarWidth = 400;
    const scoreBarHeight = 25;
    const scoreX = (doc.page.width - scoreBarWidth) / 2;

    // Background bar
    doc.rect(scoreX, doc.y, scoreBarWidth, scoreBarHeight).stroke();
    // Filled bar
    doc.rect(scoreX, doc.y, (scoreBarWidth * analysis.atsScore) / 100, scoreBarHeight)
      .fillColor(getScoreColor(analysis.atsScore)).fill()
      .fillColor('black');

    // Score text
    doc.fontSize(36).fillColor(getScoreColor(analysis.atsScore))
      .text(`${analysis.atsScore}%`, scoreX + scoreBarWidth/2 - 30, doc.y - scoreBarHeight - 10);
    doc.fillColor('black');
    doc.moveDown(2);

    // Skills Analysis
    doc.fontSize(16).text('Skills Analysis', { underline: true });
    doc.moveDown(0.5);

    // Matching Skills
    doc.fontSize(14).text('✓ Matching Skills', { underline: true });
    doc.fontSize(11);
    if (analysis.matchingSkills.length > 0) {
      analysis.matchingSkills.forEach(skill => {
        doc.text(`• ${skill}`);
      });
    } else {
      doc.text('No matching skills found');
    }
    doc.moveDown();

    // Missing Skills
    doc.fontSize(14).text('✗ Missing Skills', { underline: true });
    doc.fontSize(11);
    if (analysis.missingSkills.length > 0) {
      analysis.missingSkills.slice(0, 15).forEach(skill => {
        doc.text(`• ${skill}`);
      });
    } else {
      doc.text('All required skills are present');
    }
    doc.moveDown();

    // Resume Structure Analysis
    doc.fontSize(16).text('Resume Structure Analysis', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(14).text('Missing Sections', { underline: true });
    doc.fontSize(11);
    if (analysis.missingSections.length > 0) {
      analysis.missingSections.forEach(section => {
        doc.text(`• ${section}`);
      });
    } else {
      doc.text('All recommended sections are present');
    }
    doc.moveDown();

    // Grammar and Formatting Issues
    if (analysis.grammarIssues && analysis.grammarIssues.length > 0) {
      doc.fontSize(14).text('Grammar & Formatting Issues', { underline: true });
      doc.fontSize(11);
      analysis.grammarIssues.slice(0, 10).forEach(issue => {
        doc.text(`• ${issue.text} - ${issue.suggestion}`);
      });
      doc.moveDown();
    }

    // Actionable Recommendations
    doc.fontSize(16).text('Actionable Recommendations', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);

    if (analysis.suggestions.length > 0) {
      analysis.suggestions.forEach((suggestion, index) => {
        doc.text(`${index + 1}. ${suggestion}`);
      });
    } else {
      doc.text('Your resume is well-optimized for ATS systems.');
    }
    doc.moveDown();

    // Job Role Compatibility
    doc.fontSize(16).text('Job Role Compatibility', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Compatibility Score: ${analysis.jobRoleFit}%`, { align: 'center' });
    doc.fontSize(11).text(
      `Your background shows ${analysis.jobRoleFit}% compatibility with the ${analysis.jobRole} role. ` +
      'Consider highlighting relevant experience and skills to improve this match.'
    );
    doc.moveDown();

    // Footer
    doc.fontSize(10).text(
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
