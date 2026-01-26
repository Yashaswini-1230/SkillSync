import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUpload, FiSearch, FiDownload, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalAnalyses: 0,
    avgAtsScore: 0
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resumesRes, analysesRes] = await Promise.all([
        axios.get(`${API_URL}/resumes`),
        axios.get(`${API_URL}/analysis`)
      ]);

      setResumes(resumesRes.data);
      setAnalyses(analysesRes.data);

      // Calculate stats
      const totalAnalyses = analysesRes.data.length;
      const avgScore = totalAnalyses > 0
        ? Math.round(analysesRes.data.reduce((sum, a) => sum + a.atsScore, 0) / totalAnalyses)
        : 0;

      setStats({
        totalResumes: resumesRes.data.length,
        totalAnalyses,
        avgAtsScore: avgScore
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (analysisId) => {
    try {
      const response = await axios.get(`${API_URL}/analysis/${analysisId}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume-analysis-${analysisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const isFirstTimeUser = resumes.length === 0 && analyses.length === 0;

  return (
    <div className="min-h-screen page-content pt-20 px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-responsive-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-responsive-base text-gray-600 mb-8">Here's an overview of your resume analytics and recent activity.</p>
        </div>

        {isFirstTimeUser ? (
          // First-time user view
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-12 text-center animate-fade-in border border-white/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl"></div>
            <div className="relative max-w-lg mx-auto">
              <div className="mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <FiUpload size={48} className="text-white drop-shadow-lg" />
                </div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                  Welcome to SkillSync!
                </h2>
                <p className="text-xl text-gray-700 mb-3 font-medium">
                  Let's get you started with professional resume analysis
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Upload your resume and analyze it against job descriptions to improve your ATS compatibility
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link
                  to="/upload"
                  className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <span className="text-2xl">📎</span>
                    <span className="text-lg">Upload Resume</span>
                  </div>
                </Link>
                <Link
                  to="/builder"
                  className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <span className="text-2xl">🎨</span>
                    <span className="text-lg">Build Resume</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Returning user view
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card-enhanced p-6 animate-slide-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Resumes</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.totalResumes}</p>
                    <p className="text-xs text-gray-500 mt-1">Uploaded & saved</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                    <FiUpload className="text-blue-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="card-enhanced p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Average ATS Score</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.avgAtsScore}%</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {stats.avgAtsScore >= 80 ? 'Excellent' : stats.avgAtsScore >= 60 ? 'Good' : 'Needs improvement'}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                    <FiSearch className="text-green-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="card-enhanced p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Total Analyses</p>
                    <p className="text-4xl font-bold text-gray-900">{stats.totalAnalyses}</p>
                    <p className="text-xs text-gray-500 mt-1">Job matches analyzed</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                    <FiCalendar className="text-purple-600" size={28} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Analyses Table */}
            {analyses.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Recent Analyses</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Resume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Job Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ATS Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyses.slice(0, 10).map((analysis) => (
                        <tr key={analysis._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {analysis.resumeId?.originalName || 'Resume'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {analysis.jobRole}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                analysis.atsScore >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : analysis.atsScore >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {analysis.atsScore}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(analysis.analyzedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => downloadReport(analysis._id)}
                              className="text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                            >
                              <FiDownload size={16} />
                              <span>Download</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {analyses.length === 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600 mb-4">No analyses yet. Start analyzing your resume!</p>
                <Link
                  to="/analyze"
                  className="inline-block bg-primary-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Analyze Resume
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
