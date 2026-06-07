const axios = require('axios');

// =========================
// AI SERVICE BASE URL
// =========================

const AI_BASE_URL =
  `${process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'}/api/interview`;

// =========================
// GENERATE QUESTIONS
// =========================

const generateInterviewQuestions =
  async (
    resumeContext,
    targetRole,
    history = []
  ) => {

    try {

      const response =
        await axios.post(
          `${AI_BASE_URL}/generate-questions`,
          {
            resume_context:
              resumeContext,

            target_role:
              targetRole,

            history
          }
        );

      return response.data;

    } catch (err) {

      console.error(
        'AI Question API Error:',
        err.response?.data ||
        err.message
      );

      return {

        question:
          'Can you introduce yourself and explain your recent technical projects?'

      };

    }

  };

// =========================
// EVALUATE ANSWER
// =========================

const evaluateAnswer =
  async (
    question,
    answer,
    context
  ) => {

    try {

      const response =
        await axios.post(
          `${AI_BASE_URL}/evaluate-answer`,
          {
            question,
            answer,
            context
          }
        );

      return response.data;

    } catch (err) {

      console.error(
        'AI Evaluation API Error:',
        err.response?.data ||
        err.message
      );

      // =========================
      // Dynamic Fallback Scoring
      // =========================

      const answerLength =
        answer.split(' ').length;

      let score = 3;

      if (answerLength > 5)
        score += 1;

      if (answerLength > 15)
        score += 2;

      if (answerLength > 30)
        score += 2;

      score = Math.min(
        10,
        score
      );

      let feedback =
        '';

      if (score <= 3) {

        feedback =
          'Your answer was too short and lacked sufficient explanation. Try explaining your technical approach, implementation details, and project impact.';

      } else if (
        score <= 5
      ) {

        feedback =
          'Your answer has some relevance, but it needs more structure, technical depth, and clearer communication.';

      } else if (
        score <= 7
      ) {

        feedback =
          'Good attempt. Your answer demonstrates reasonable understanding, but adding more technical details and measurable outcomes would improve it further.';

      } else {

        feedback =
          'Strong answer. You communicated your ideas clearly and demonstrated solid technical understanding with relevant project experience.';

      }

      return {

        score,

        communication_score:
          score,

        confidence_score:
          score - 1,

        technical_depth_score:
          score,

        clarity_score:
          score,

        problem_solving_score:
          score,

        feedback,

        strengths: [
          'Relevant answer',
          'Good communication'
        ],

        improvements: [
          'Add more technical depth',
          'Use structured explanations'
        ]

      };

    }

  };

module.exports = {

  generateInterviewQuestions,

  evaluateAnswer

};
