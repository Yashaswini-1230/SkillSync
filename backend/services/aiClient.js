const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/api';

/**
 * Client to communicate with the Python FastAPI AI Service
 */
const aiClient = {
    /**
     * Send resume file to AI service for parsing
     */
    parseResume: async (fileBuffer, filename) => {
        try {
            const formData = new FormData();
            const blob = new Blob([fileBuffer], { type: 'application/pdf' });
            formData.append('file', blob, filename);

            const response = await axios.post(`${AI_SERVICE_URL}/resume/parse`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error parsing resume via AI service:', error.message);
            throw new Error('AI Service parsing failed');
        }
    },

    /**
     * Get semantic ATS score and feedback
     */
    analyzeAndScore: async (resumeText, jobDescription) => {
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/analyzer/score`, {
                resume_text: resumeText,
                job_description: jobDescription
            });
            return response.data;
        } catch (error) {
            console.error('Error analyzing via AI service:', error.message);
            throw new Error('AI Service analysis failed');
        }
    },

    /**
     * Generate dynamic interview questions
     */
    generateInterviewQuestions: async (resumeContext, targetRole) => {
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/interview/generate-questions`, {
                resume_context: resumeContext,
                target_role: targetRole
            });
            return response.data;
        } catch (error) {
            console.error('Error generating questions via AI service:', error.message);
            throw new Error('AI Service question generation failed');
        }
    },

    /**
     * Evaluate candidate answer
     */
    evaluateAnswer: async (question, answer, context) => {
        try {
            const response = await axios.post(`${AI_SERVICE_URL}/interview/evaluate-answer`, {
                question,
                answer,
                context
            });
            return response.data;
        } catch (error) {
            console.error('Error evaluating answer via AI service:', error.message);
            throw new Error('AI Service answer evaluation failed');
        }
    }
};

module.exports = aiClient;
