import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiMessageSquare, FiFileText, FiBriefcase } from 'react-icons/fi';
import toast from 'react-hot-toast';

const InterviewPrep = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [customJobRole, setCustomJobRole] = useState('');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const jobRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Analyst',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
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

  const handleGenerate = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }

    const finalJobRole = jobRole === 'Other' ? customJobRole : jobRole;
    if (!finalJobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`${API_URL}/interview/generate`, {
        resumeId: selectedResume,
        jobRole: finalJobRole
      });

      setQuestions(response.data.questions);
      toast.success('Interview questions generated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate questions';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 md:ml-64 px-4 py-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <FiMessageSquare size={32} className="text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Interview Preparation</h1>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className="space-y-6">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {resumes.map((resume) => (
                    <option key={resume._id} value={resume._id}>
                      {resume.originalName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role
              </label>
              <select
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a job role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {jobRole === 'Other' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Job Role
                </label>
                <input
                  type="text"
                  value={customJobRole}
                  onChange={(e) => setCustomJobRole(e.target.value)}
                  placeholder="e.g., Machine Learning Engineer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={generating || !selectedResume || !jobRole}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <FiMessageSquare size={20} />
              <span>{generating ? 'Generating Questions...' : 'Generate Interview Questions'}</span>
            </button>
          </div>
        </div>

        {/* Questions Display */}
        {questions.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FiBriefcase size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Interview Questions ({questions.length})
              </h2>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-primary-500 pl-6 py-4 bg-gray-50 rounded-r-lg"
                >
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                          q.type === 'technical'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {q.type === 'technical' ? 'Technical' : 'Behavioral'}
                      </span>
                      <p className="text-gray-900 font-medium">{q.question}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>Tip:</strong> Practice answering these questions out loud. Prepare specific examples
                from your experience that demonstrate your skills and achievements.
              </p>
            </div>
          </div>
        )}

        {questions.length === 0 && !generating && (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <FiFileText size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Select your resume and job role, then generate interview questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPrep;
