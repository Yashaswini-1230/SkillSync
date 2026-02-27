import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiFileText, FiBriefcase, FiSliders } from 'react-icons/fi';
import toast from 'react-hot-toast';

const InterviewPrep = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const roleOptions = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Scientist',
    'DevOps Engineer',
    'Machine Learning Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Other'
  ];

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API_URL}/resumes`);
      setResumes(response.data);
      if (response.data.length > 0) {
        setSelectedResume(response.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    }
  };

  const buildAnswer = (question, type) => {
    if (!question) return '';
    const baseRole = role || 'this role';
    if (type === 'behavioral' || question.toLowerCase().includes('tell me about')) {
      return `Use the STAR format. Briefly describe the situation and your task, then explain the specific actions you took and finish with a measurable result. Tie the example back to how it prepares you for ${baseRole}.`;
    }
    if (question.toLowerCase().includes('challenge') || question.toLowerCase().includes('difficult')) {
      return `Pick a concrete example, summarize the technical or team challenge, explain 2–3 actions you personally took, and end with a clear outcome (metrics, impact, or what you learned that helps in ${baseRole}).`;
    }
    return `Start by stating your approach, then walk through 2–3 key steps or design decisions, and close with the impact. Highlight tools and patterns that are commonly expected from a ${baseRole}.`;
  };

  const normalizeQuestions = (rawQuestions) => {
    const technical = [];
    const hr = [];

    rawQuestions.forEach((q) => {
      const type = q.type || 'technical';
      const bucket = type === 'behavioral' || type === 'hr' ? hr : technical;
      bucket.push({
        ...q,
        answer: buildAnswer(q.question, type)
      });
    });

    // Ensure at least 5–10 technical and ~3 HR questions by topping up with generic, role-aware prompts
    const targetTech = Math.max(5, Math.min(10, technical.length || 5));
    const targetHr = 3;

    const techTemplates = [
      `Walk me through a ${role || 'recent'} project you are most proud of. What was your role, and what was the measurable impact?`,
      `How would you design a simple system or feature that is commonly required for ${role || 'this role'}?`,
      `Describe a time you debugged a tricky production issue. How did you isolate the problem and verify the fix?`
    ];

    while (technical.length < targetTech && techTemplates.length) {
      const qText = techTemplates.shift();
      technical.push({
        type: 'technical',
        question: qText,
        answer: buildAnswer(qText, 'technical')
      });
    }

    const hrTemplates = [
      `Why are you specifically interested in a ${role || 'this'} position at this stage of your career?`,
      `Tell me about a time you disagreed with a teammate or manager. How did you handle it?`,
      `Describe a situation where you had to quickly adapt to a major change in priorities.`
    ];

    while (hr.length < targetHr && hrTemplates.length) {
      const qText = hrTemplates.shift();
      hr.push({
        type: 'behavioral',
        question: qText,
        answer: buildAnswer(qText, 'behavioral')
      });
    }

    return { technical, hr };
  };

  const handleGenerate = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/interview/generate`, {
        resumeId: selectedResume,
        role,
        difficulty
      });

      const normalized = normalizeQuestions(response.data.questions || []);
      setQuestions(normalized);
      toast.success(`Generated ${response.data.questions.length} interview questions!`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate questions';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen page-content pt-20 px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <FiMessageSquare size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Interview Preparation</h1>
              <p className="text-gray-600">
                Generate resume-aware questions and model answers tailored to your target role.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: resume + role + difficulty */}
          <div className="card-enhanced p-6 lg:col-span-2">
            <div className="space-y-6">
              {/* Resume selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Resume
                </label>
                {resumes.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">No resumes uploaded yet.</p>
                    <a
                      href="/upload"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Upload a resume first
                    </a>
                  </div>
                ) : (
                  <select
                    value={selectedResume}
                    onChange={(e) => setSelectedResume(e.target.value)}
                    className="input-enhanced"
                  >
                    {resumes.map((resume) => (
                      <option key={resume._id} value={resume._id}>
                        {resume.originalName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Role + difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input-enhanced"
                  >
                    <option value="">Select role (optional)</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="input-enhanced"
                  >
                    <option value="easy">Easy / Warm-up</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating || !selectedResume}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSliders size={20} />
                <span>{generating ? 'Generating...' : 'Generate Interview Questions'}</span>
              </button>
            </div>
          </div>

          {/* Right: helper card */}
          <div className="card-enhanced p-6 bg-gradient-to-br from-primary-50 to-indigo-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">How to use this</h3>
            <p className="text-xs text-gray-600 mb-3">
              Choose the resume you plan to share, optionally pick a target role and difficulty, then generate questions.
              Practice out loud using the suggested model answers as a starting point, not a script.
            </p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>5–10 technical questions tailored to your resume</li>
              <li>3 role-agnostic HR / behavioral questions</li>
              <li>Guided model answers using STAR and impact-focused structure</li>
            </ul>
          </div>
        </div>

        {/* Questions Display */}
        {questions.technical && (questions.technical.length > 0 || questions.hr.length > 0) && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FiBriefcase size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Your Interview Questions ({questions.technical.length + questions.hr.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Technical Questions ({questions.technical.length})
                </h3>
                <div className="space-y-4">
                  {questions.technical.map((q, idx) => (
                    <div
                      key={`tech-${idx}`}
                      className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50/60 rounded-r-lg"
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Model answer guide:</span> {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  HR / Behavioral Questions ({questions.hr.length})
                </h3>
                <div className="space-y-4">
                  {questions.hr.map((q, idx) => (
                    <div
                      key={`hr-${idx}`}
                      className="border-l-4 border-purple-500 pl-4 py-3 bg-purple-50/70 rounded-r-lg"
                    >
                      <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">Model answer guide:</span> {q.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>Tip:</strong> Don&apos;t memorize these answers word-for-word. Use them to structure your own
                stories around concrete projects, metrics, and challenges from your resume.
              </p>
            </div>
          </div>
        )}

        {!questions.technical && !generating && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FiFileText size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Select your resume and job role, then generate interview questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
