const express = require('express');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate interview questions based on resume and job role
function generateInterviewQuestions(resumeData, jobRole) {
  const questions = [];

  // Technical questions based on skills
  if (resumeData.parsedData?.skills && resumeData.parsedData.skills.length > 0) {
    const skills = resumeData.parsedData.skills.slice(0, 5);
    skills.forEach(skill => {
      questions.push({
        type: 'technical',
        question: `Can you explain your experience with ${skill}? Describe a project where you used ${skill}.`
      });
    });
  }

  // Role-specific questions
  const roleQuestions = {
    'Software Engineer': [
      'Walk me through your approach to debugging a complex issue.',
      'How do you ensure code quality in your projects?',
      'Describe a challenging technical problem you solved.'
    ],
    'Frontend Developer': [
      'How do you optimize React applications for performance?',
      'Explain your approach to responsive design.',
      'What is your experience with state management?'
    ],
    'Backend Developer': [
      'How do you design scalable APIs?',
      'Explain database optimization techniques you\'ve used.',
      'Describe your experience with microservices architecture.'
    ],
    'Data Analyst': [
      'How do you approach data cleaning and preprocessing?',
      'Describe a time you found insights from complex data.',
      'What tools do you use for data visualization?'
    ]
  };

  const roleSpecific = roleQuestions[jobRole] || [
    'What makes you a good fit for this role?',
    'Describe a challenging project you worked on.',
    'How do you stay updated with industry trends?'
  ];

  roleSpecific.forEach(q => {
    questions.push({ type: 'technical', question: q });
  });

  // Behavioral questions
  const behavioralQuestions = [
    'Tell me about a time you worked in a team to achieve a goal.',
    'Describe a situation where you had to learn something new quickly.',
    'How do you handle tight deadlines and multiple priorities?',
    'Tell me about a mistake you made and how you handled it.',
    'Describe a time you had to explain a technical concept to a non-technical person.'
  ];

  behavioralQuestions.forEach(q => {
    questions.push({ type: 'behavioral', question: q });
  });

  return questions.slice(0, 7); // Return 5-7 questions
}

// @route   POST /api/interview/generate
// @desc    Generate interview questions
// @access  Private
router.post('/generate', auth, [
  body('resumeId').notEmpty().withMessage('Resume ID is required'),
  body('jobRole').notEmpty().withMessage('Job role is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resumeId, jobRole } = req.body;

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Generate questions
    const questions = generateInterviewQuestions(resume, jobRole);

    res.json({
      message: 'Interview questions generated successfully',
      jobRole,
      questions
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ message: 'Error generating interview questions' });
  }
});

module.exports = router;
