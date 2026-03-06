import React, { useState } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiFileText, FiBriefcase, FiSliders } from 'react-icons/fi';
import toast from 'react-hot-toast';

const InterviewPrep = () => {
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [role, setRole] = useState('');

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

  const normalizeQuestions = (rawQuestions) => {
    const technical = [];
    const hr = [];

    (rawQuestions || []).forEach((q) => {
      const type = q.type || 'technical';
      const bucket = type === 'behavioral' || type === 'hr' ? hr : technical;
      bucket.push(q);
    });

    return { technical, hr };
  };

  const handleGenerate = async () => {
    if (!role) {
      toast.error('Please select a target role');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/interview/generate`, {
        role
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
                Generate interview questions tailored to your target role.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left: role-based generation only */}
          <div className="card-enhanced p-6 lg:col-span-2">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input-enhanced"
                >
                  <option value="">Select a role</option>
                  {roleOptions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating || !role}
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
              Pick the role you are interviewing for and generate realistic technical, behavioral, and scenario questions. Practice answering them on your own.
            </p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              <li>5–10 role-specific technical questions</li>
              <li>Behavioral and scenario questions like a real interview</li>
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
                      <p className="text-sm font-medium text-gray-900">{q.question}</p>
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
                      <p className="text-sm font-medium text-gray-900">{q.question}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {!questions.technical && !generating && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FiFileText size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Select a target role, then generate interview questions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
