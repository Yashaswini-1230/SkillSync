const express = require('express');
const { body, validationResult } = require('express-validator');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate truly resume-specific interview questions
function generateInterviewQuestions(resumeData) {
  const questions = [];
  const parsedData = resumeData.parsedData || {};
  const resumeText = resumeData.extractedText || '';

  // Extract specific information from resume
  const skills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
  const experience = parsedData.experience || [];
  const projects = parsedData.projects || [];
  const education = parsedData.education || [];

  // 1. SKILL-SPECIFIC QUESTIONS (based on actual skills in resume)
  if (skills.length > 0) {
    const topSkills = skills.slice(0, 3); // Focus on most prominent skills

    topSkills.forEach(skill => {
      // Create skill-specific questions based on the actual skill mentioned
      const skillQuestions = [
        `Based on your resume, you have experience with ${skill}. Can you walk me through a specific project where you applied ${skill} to solve a problem?`,
        `Your resume mentions ${skill} as a skill. How have you kept your ${skill} knowledge current in your recent work?`,
        `I see ${skill} listed in your technical skills. Can you describe a challenging situation where your ${skill} expertise was crucial?`,
        `How do you approach using ${skill} in team environments, based on your experience?`
      ];

      const randomQuestion = skillQuestions[Math.floor(Math.random() * skillQuestions.length)];
      questions.push({
        type: 'technical',
        question: randomQuestion
      });
    });
  }

  // 2. EXPERIENCE-BASED QUESTIONS (based on actual job titles/companies)
  if (experience.length > 0) {
    experience.slice(0, 2).forEach((exp, index) => {
      if (exp.title && exp.company) {
        const experienceQuestions = [
          `In your role as ${exp.title} at ${exp.company}, can you describe a technical challenge you faced and how you solved it?`,
          `Your resume shows you worked as ${exp.title} at ${exp.company}. What was your biggest accomplishment in that position?`,
          `As a ${exp.title} at ${exp.company}, how did you contribute to team goals or project success?`,
          `What technical skills did you develop or improve during your time as ${exp.title} at ${exp.company}?`
        ];

        const randomQuestion = experienceQuestions[Math.floor(Math.random() * experienceQuestions.length)];
        questions.push({
          type: 'technical',
          question: randomQuestion
        });
      }
    });
  }

  // 3. PROJECT-BASED QUESTIONS (based on actual projects mentioned)
  if (projects.length > 0) {
    projects.slice(0, 2).forEach((project, index) => {
      if (project.name) {
        const projectQuestions = [
          `Your resume mentions the ${project.name} project. Can you walk me through the technical challenges you faced and how you addressed them?`,
          `In the ${project.name} project, what technologies or methodologies did you use, and why were they appropriate for this work?`,
          `How did the ${project.name} project contribute to your professional development or technical skills?`,
          `What was the most valuable lesson you learned from working on the ${project.name} project?`
        ];

        const randomQuestion = projectQuestions[Math.floor(Math.random() * projectQuestions.length)];
        questions.push({
          type: 'technical',
          question: randomQuestion
        });
      }
    });
  }

  // 4. EDUCATION-BASED QUESTIONS (if recent graduate or specific field)
  if (education.length > 0 && experience.length < 2) {
    const recentEdu = education[0];
    if (recentEdu.degree && recentEdu.institution) {
      const educationQuestions = [
        `As a ${recentEdu.degree} graduate from ${recentEdu.institution}, how have you applied your academic knowledge in practical work settings?`,
        `Your ${recentEdu.degree} from ${recentEdu.institution} - what specific coursework or projects prepared you for this role?`,
        `How has your ${recentEdu.degree} education influenced your approach to problem-solving in professional environments?`
      ];

      const randomQuestion = educationQuestions[Math.floor(Math.random() * educationQuestions.length)];
      questions.push({
        type: 'technical',
        question: randomQuestion
      });
    }
  }

  // 5. BEHAVIORAL QUESTIONS (tailored to resume context)
  const behavioralQuestions = [];

  // Add leadership questions if they have management experience
  if (resumeText.toLowerCase().includes('lead') || resumeText.toLowerCase().includes('manage') || resumeText.toLowerCase().includes('team')) {
    behavioralQuestions.push('Tell me about a time when you had to lead a team through a challenging technical project.');
  }

  // Add collaboration questions if they mention team work
  if (resumeText.toLowerCase().includes('collaborat') || resumeText.toLowerCase().includes('team')) {
    behavioralQuestions.push('Describe a situation where you had to collaborate with colleagues from different departments to solve a problem.');
  }

  // General behavioral questions
  const generalBehavioral = [
    'Tell me about a technical decision you made that had a significant impact on a project.',
    'Describe a time when you had to adapt quickly to a new technology or process.',
    'How do you handle receiving constructive criticism about your technical work?',
    'Tell me about a goal you set for yourself professionally and how you achieved it.',
    'Describe a situation where you had to balance multiple competing priorities.'
  ];

  // Add behavioral questions to reach desired count
  const targetBehavioral = Math.max(2, Math.min(3, 7 - questions.length));
  while (behavioralQuestions.length < targetBehavioral && generalBehavioral.length > 0) {
    const randomIndex = Math.floor(Math.random() * generalBehavioral.length);
    behavioralQuestions.push(generalBehavioral.splice(randomIndex, 1)[0]);
  }

  behavioralQuestions.forEach(question => {
    questions.push({
      type: 'behavioral',
      question: question
    });
  });

  // 6. SCENARIO-BASED QUESTIONS (industry-relevant)
  const scenarioQuestions = [
    'How would you approach debugging a complex issue in a production environment with time pressure?',
    'If you were asked to estimate a project timeline for unfamiliar work, how would you approach it?',
    'How do you stay current with industry trends and new technologies in your field?',
    'Describe your process for explaining complex technical concepts to non-technical stakeholders.',
    'How do you handle situations where project requirements change midway through development?'
  ];

  // Add 1-2 scenario questions
  const numScenarios = Math.min(2, Math.max(0, 7 - questions.length));
  for (let i = 0; i < numScenarios; i++) {
    const randomIndex = Math.floor(Math.random() * scenarioQuestions.length);
    const question = scenarioQuestions.splice(randomIndex, 1)[0];
    questions.push({
      type: 'scenario',
      question: question
    });
  }

  // Shuffle and return 5-7 questions
  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.floor(Math.random() * 3) + 5); // Random 5-7 questions
}

// @route   POST /api/interview/generate
// @desc    Generate interview questions
// @access  Private
router.post('/generate', auth, [
  body('resumeId').notEmpty().withMessage('Resume ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resumeId } = req.body;

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Generate questions based on resume content
    const questions = generateInterviewQuestions(resume);

    res.json({
      message: 'Interview questions generated successfully',
      questions
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ message: 'Error generating interview questions' });
  }
});

module.exports = router;
