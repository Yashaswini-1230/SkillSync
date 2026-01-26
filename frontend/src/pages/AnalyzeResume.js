import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiFileText, FiBriefcase, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const AnalyzeResume = () => {
  const [step, setStep] = useState(1);
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [savedResumes, setSavedResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [selectedResumeType, setSelectedResumeType] = useState(''); // 'uploaded' or 'saved'
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
      const [uploadedResponse, savedResponse] = await Promise.all([
        axios.get(`${API_URL}/resumes`),
        axios.get(`${API_URL}/saved-resumes`)
      ]);

      setUploadedResumes(uploadedResponse.data);
      setSavedResumes(savedResponse.data);

      // Default to first uploaded resume if available, otherwise first saved resume
      if (uploadedResponse.data.length > 0) {
        setSelectedResume(uploadedResponse.data[0]._id);
        setSelectedResumeType('uploaded');
      } else if (savedResponse.data.length > 0) {
        setSelectedResume(savedResponse.data[0]._id);
        setSelectedResumeType('saved');
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

    if (selectedResumeType === 'saved') {
      toast.error('Saved resumes need to be uploaded as PDF/DOCX files for analysis. Please use the Upload Resume page.');
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
    <div className="min-h-screen page-content pt-20 px-4 sm:px-6 lg:px-8 py-8 pb-20">
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

            {uploadedResumes.length === 0 && savedResumes.length === 0 ? (
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
                  value={`${selectedResumeType}-${selectedResume}`}
                  onChange={(e) => {
                    const [type, id] = e.target.value.split('-');
                    setSelectedResume(id);
                    setSelectedResumeType(type);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <optgroup label="Uploaded Resumes">
                    {uploadedResumes.map((resume) => (
                      <option key={`uploaded-${resume._id}`} value={`uploaded-${resume._id}`}>
                        📎 {resume.originalName}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Saved Resumes">
                    {savedResumes.map((resume) => (
                      <option key={`saved-${resume._id}`} value={`saved-${resume._id}`}>
                        💾 {resume.name} ({resume.template} template)
                      </option>
                    ))}
                  </optgroup>
                </select>

                {(uploadedResumes.length === 0 || savedResumes.length === 0) && (
                  <div className="text-sm text-gray-600 space-y-1">
                    {uploadedResumes.length === 0 && (
                      <p>💡 <a href="/upload" className="text-primary-600 hover:underline">Upload a resume</a> for analysis</p>
                    )}
                    {savedResumes.length === 0 && (
                      <p>💡 <a href="/builder" className="text-primary-600 hover:underline">Create a resume</a> in the builder</p>
                    )}
                  </div>
                )}

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
                  {selectedResumeType === 'uploaded'
                    ? uploadedResumes.find((r) => r._id === selectedResume)?.originalName
                    : savedResumes.find((r) => r._id === selectedResume)?.name}
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
                <div className={`text-4xl font-bold ${getScoreColor(analysisResult.atsScore)} px-8 py-4 rounded-xl`}>
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

            {/* Skills Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Matching Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Matching Skills ({analysisResult.matchingSkills.length})
                </h3>
                <div className="space-y-2">
                  {analysisResult.matchingSkills.length > 0 ? (
                    analysisResult.matchingSkills.map((skill, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-sm text-gray-700">{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">No matching skills found</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Missing Skills ({analysisResult.missingSkills.length})
                </h3>
                <div className="space-y-2">
                  {analysisResult.missingSkills.length > 0 ? (
                    analysisResult.missingSkills.slice(0, 10).map((skill, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-sm text-gray-700">{skill}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">All required skills present</p>
                  )}
                </div>
              </div>
            </div>

            {/* Missing Sections */}
            {analysisResult.missingSections.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  Missing Resume Sections
                </h3>
                <div className="space-y-2">
                  {analysisResult.missingSections.map((section, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-sm text-gray-700">{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Recommendations */}
            {analysisResult.suggestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  Actionable Recommendations
                </h3>
                <div className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar Issues */}
            {analysisResult.grammarIssues && analysisResult.grammarIssues.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                  Grammar & Formatting Issues ({analysisResult.grammarIssues.length})
                </h3>
                <div className="space-y-2">
                  {analysisResult.grammarIssues.slice(0, 5).map((issue, idx) => (
                    <div key={idx} className="bg-orange-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-800">"{issue.text}"</p>
                      <p className="text-sm text-orange-700 mt-1">Suggestion: {issue.suggestion}</p>
                    </div>
                  ))}
                </div>
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
