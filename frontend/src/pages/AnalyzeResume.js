import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFileText, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AnalyzeResume = () => {
  const [step, setStep] = useState(1);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [customJobRole, setCustomJobRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const navigate = useNavigate();
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

  const handleAnalyze = async () => {
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }

    const finalJobRole = jobRole === 'Other' ? customJobRole : jobRole;
    if (!finalJobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please paste the job description');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await axios.post(`${API_URL}/analysis`, {
        resumeId: selectedResume,
        jobRole: finalJobRole,
        jobDescription
      });

      const analysisData = response.data.analysis;
      setAnalysisResult({
        ...analysisData,
        id: analysisData.id || analysisData._id
      });
      setStep(4);
      toast.success('Analysis completed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to analyze resume';
      toast.error(message);
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadReport = async () => {
    if (!analysisResult) return;

    try {
      const response = await axios.get(`${API_URL}/analysis/${analysisResult.id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-analysis-${analysisResult.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen pt-16 md:ml-64 px-4 py-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analyze Resume</h1>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > s ? <FiCheckCircle size={20} /> : s}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    {s === 1 ? 'Select Resume' : s === 2 ? 'Job Details' : 'Analyze'}
                  </div>
                </div>
                {s < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      step > s ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Resume */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FiFileText size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Select Resume</h2>
            </div>

            {resumes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No resumes uploaded yet.</p>
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Upload Resume
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a resume to analyze
                </label>
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
                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors mt-6"
                >
                  Next Step
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Job Details */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FiBriefcase size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
            </div>

            <div className="space-y-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Analyze */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="flex items-center space-x-3 mb-6">
              <FiSearch size={24} className="text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Ready to Analyze</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Resume:</p>
                <p className="font-medium text-gray-900">
                  {resumes.find((r) => r._id === selectedResume)?.originalName}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Job Role:</p>
                <p className="font-medium text-gray-900">
                  {jobRole === 'Other' ? customJobRole : jobRole}
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && analysisResult && (
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Complete!</h2>
              <div className="inline-block">
                <div className={`text-6xl font-bold ${getScoreColor(analysisResult.atsScore)} px-8 py-4 rounded-xl`}>
                  {analysisResult.atsScore}%
                </div>
                <p className="text-gray-600 mt-2">ATS Score</p>
              </div>
            </div>

            {/* Score Meter */}
            <div className="mb-8">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    analysisResult.atsScore >= 80
                      ? 'bg-green-500'
                      : analysisResult.atsScore >= 60
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${analysisResult.atsScore}%` }}
                />
              </div>
            </div>

            {/* Matching Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Matching Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.matchingSkills.length > 0 ? (
                  analysisResult.matchingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600">No matching skills found</p>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills.length > 0 ? (
                  analysisResult.missingSkills.slice(0, 10).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-600">No missing skills</p>
                )}
              </div>
            </div>

            {/* Suggestions */}
            {analysisResult.suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Suggestions</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {analysisResult.suggestions.map((suggestion, idx) => (
                    <li key={idx}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setStep(1);
                  setAnalysisResult(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                New Analysis
              </button>
              <button
                onClick={downloadReport}
                className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Download Report (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeResume;
