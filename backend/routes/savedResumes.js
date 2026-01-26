const express = require('express');
const { body, validationResult } = require('express-validator');
const SavedResume = require('../models/SavedResume');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');

const router = express.Router();

// @route   POST /api/saved-resumes
// @desc    Save a resume
// @access  Private
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Resume name is required'),
  body('template').isIn(['modern-professional', 'minimal-tech', 'classic-ats', 'two-column-professional', 'creative', 'compact-fresher', 'executive']).withMessage('Invalid template'),
  body('resumeData').isObject().withMessage('Resume data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, template, resumeData } = req.body;

    // Check if resume with same name already exists for this user
    const existingResume = await SavedResume.findOne({
      userId: req.user._id,
      name: name.trim()
    });

    if (existingResume) {
      return res.status(400).json({
        message: 'A resume with this name already exists. Please choose a different name.'
      });
    }

    // Create new saved resume
    const savedResume = new SavedResume({
      userId: req.user._id,
      name: name.trim(),
      template,
      resumeData
    });

    await savedResume.save();

    res.status(201).json({
      message: 'Resume saved successfully',
      resume: {
        id: savedResume._id,
        name: savedResume.name,
        template: savedResume.template,
        createdAt: savedResume.createdAt
      }
    });
  } catch (error) {
    console.error('Save resume error:', error);
    res.status(500).json({ message: 'Error saving resume' });
  }
});

// @route   GET /api/saved-resumes
// @desc    Get all saved resumes for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const savedResumes = await SavedResume.find({ userId: req.user._id })
      .sort({ updatedAt: -1 })
      .select('name template createdAt updatedAt');

    res.json(savedResumes);
  } catch (error) {
    console.error('Get saved resumes error:', error);
    res.status(500).json({ message: 'Error fetching saved resumes' });
  }
});

// @route   GET /api/saved-resumes/:id
// @desc    Get a specific saved resume
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const savedResume = await SavedResume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!savedResume) {
      return res.status(404).json({ message: 'Saved resume not found' });
    }

    res.json(savedResume);
  } catch (error) {
    console.error('Get saved resume error:', error);
    res.status(500).json({ message: 'Error fetching saved resume' });
  }
});

// @route   PUT /api/saved-resumes/:id
// @desc    Update a saved resume
// @access  Private
router.put('/:id', auth, [
  body('name').optional().trim().notEmpty().withMessage('Resume name cannot be empty'),
  body('template').optional().isIn(['modern-professional', 'minimal-tech', 'classic-ats', 'two-column-professional', 'creative', 'compact-fresher', 'executive']).withMessage('Invalid template'),
  body('resumeData').optional().isObject().withMessage('Resume data must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, template, resumeData } = req.body;

    // Check if name is being changed and if it conflicts
    if (name) {
      const existingResume = await SavedResume.findOne({
        userId: req.user._id,
        name: name.trim(),
        _id: { $ne: req.params.id }
      });

      if (existingResume) {
        return res.status(400).json({
          message: 'A resume with this name already exists. Please choose a different name.'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (template) updateData.template = template;
    if (resumeData) updateData.resumeData = resumeData;

    const savedResume = await SavedResume.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!savedResume) {
      return res.status(404).json({ message: 'Saved resume not found' });
    }

    res.json({
      message: 'Resume updated successfully',
      resume: {
        id: savedResume._id,
        name: savedResume.name,
        template: savedResume.template,
        updatedAt: savedResume.updatedAt
      }
    });
  } catch (error) {
    console.error('Update saved resume error:', error);
    res.status(500).json({ message: 'Error updating saved resume' });
  }
});

// @route   DELETE /api/saved-resumes/:id
// @desc    Delete a saved resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const savedResume = await SavedResume.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!savedResume) {
      return res.status(404).json({ message: 'Saved resume not found' });
    }

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete saved resume error:', error);
    res.status(500).json({ message: 'Error deleting saved resume' });
  }
});

// @route   GET /api/saved-resumes/:id/download
// @desc    Download saved resume as PDF
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const savedResume = await SavedResume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!savedResume) {
      return res.status(404).json({ message: 'Saved resume not found' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `${savedResume.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    const resumeData = savedResume.resumeData;

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text(resumeData.personalInfo.name || 'Your Name', { align: 'center' });
    doc.moveDown(0.5);

    // Contact Info
    const contactInfo = [];
    if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email);
    if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone);
    if (resumeData.personalInfo.linkedin) contactInfo.push(resumeData.personalInfo.linkedin);
    if (resumeData.personalInfo.github) contactInfo.push(resumeData.personalInfo.github);
    if (resumeData.personalInfo.address) contactInfo.push(resumeData.personalInfo.address);

    if (contactInfo.length > 0) {
      doc.fontSize(10).font('Helvetica').text(contactInfo.join(' • '), { align: 'center' });
      doc.moveDown();
    }

    // Summary
    if (resumeData.summary) {
      doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL SUMMARY', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(resumeData.summary, { align: 'justify' });
      doc.moveDown();
    }

    // Skills
    const allSkills = [...(resumeData.skills.technical || []), ...(resumeData.skills.soft || [])];
    if (allSkills.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('SKILLS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(allSkills.join(' • '));
      doc.moveDown();
    }

    // Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('PROFESSIONAL EXPERIENCE', { underline: true });
      doc.moveDown(0.5);

      resumeData.experience.forEach((exp, idx) => {
        doc.fontSize(12).font('Helvetica-Bold').text(exp.title);
        doc.fontSize(11).font('Helvetica').text(`${exp.company} • ${exp.duration}`);
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(exp.description, { align: 'justify' });
        if (idx < resumeData.experience.length - 1) doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('EDUCATION', { underline: true });
      doc.moveDown(0.5);

      resumeData.education.forEach((edu, idx) => {
        doc.fontSize(12).font('Helvetica-Bold').text(edu.degree);
        doc.fontSize(11).font('Helvetica').text(edu.institution);
        doc.fontSize(10).font('Helvetica').text(`${edu.startYear} - ${edu.endYear || 'Present'}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}`);
        if (idx < resumeData.education.length - 1) doc.moveDown(0.3);
      });
      doc.moveDown();
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('PROJECTS', { underline: true });
      doc.moveDown(0.5);

      resumeData.projects.forEach((proj, idx) => {
        doc.fontSize(12).font('Helvetica-Bold').text(proj.name);
        const duration = proj.startMonth && proj.startYear ?
          `${proj.startMonth} ${proj.startYear} - ${proj.isPresent ? 'Present' : (proj.endMonth && proj.endYear ? `${proj.endMonth} ${proj.endYear}` : '')}` : '';
        if (duration) {
          doc.fontSize(10).font('Helvetica').text(duration);
        }
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(proj.description, { align: 'justify' });
        if (idx < resumeData.projects.length - 1) doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Certifications
    if (resumeData.certifications && resumeData.certifications.length > 0) {
      doc.fontSize(14).font('Helvetica-Bold').text('CERTIFICATIONS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').text(resumeData.certifications.join(' • '));
    }

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      `Generated by SkillSync on ${new Date().toLocaleDateString()}`,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Download resume PDF error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

module.exports = router;