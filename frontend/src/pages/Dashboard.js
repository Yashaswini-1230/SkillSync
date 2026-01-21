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
    <div className="min-h-screen pt-16 md:ml-64 px-4 py-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        {isFirstTimeUser ? (
          // First-time user view
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUpload size={40} className="text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user?.name}!</h2>
                <p className="text-gray-600 mb-8">
                  Upload your resume & job description to get started with SkillSync
                </p>
              </div>

              <div className="space-y-4">
                <Link
                  to="/upload"
                  className="block w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Upload Resume
                </Link>
                <Link
                  to="/analyze"
                  className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Analyze Resume
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Returning user view
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Resumes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalResumes}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FiUpload className="text-primary-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">ATS Score</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.avgAtsScore}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiSearch className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Analyses</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAnalyses}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiCalendar className="text-blue-600" size={24} />
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
