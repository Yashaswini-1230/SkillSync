import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiFileText, FiEdit2, FiTrash2, FiDownload, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SavedResumes = () => {
  const [savedResumes, setSavedResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchSavedResumes();
  }, []);

  const fetchSavedResumes = async () => {
    try {
      const response = await axios.get(`${API_URL}/saved-resumes`);
      setSavedResumes(response.data);
    } catch (error) {
      console.error('Error fetching saved resumes:', error);
      toast.error('Failed to load saved resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/saved-resumes/${id}`);
      toast.success('Resume deleted successfully');
      fetchSavedResumes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting resume:', error);
      toast.error('Failed to delete resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = async (resume) => {
    try {
      const response = await axios.get(`${API_URL}/saved-resumes/${resume._id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${resume.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Downloaded "${resume.name}" successfully!`);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast.error('Failed to download resume PDF');
    }
  };


  const getTemplateColor = (template) => {
    switch (template) {
      case 'modern-professional': return 'bg-blue-100 text-blue-800';
      case 'minimal-tech': return 'bg-green-100 text-green-800';
      case 'classic-ats': return 'bg-gray-100 text-gray-800';
      case 'two-column-professional': return 'bg-purple-100 text-purple-800';
      case 'creative': return 'bg-pink-100 text-pink-800';
      case 'compact-fresher': return 'bg-yellow-100 text-yellow-800';
      case 'executive': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-content pt-20 px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Resumes</h1>
            <p className="text-gray-600">Manage your saved resume templates and data</p>
          </div>
          <Link
            to="/builder"
            className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FiPlus size={20} />
            <span>Create New Resume</span>
          </Link>
        </div>

        {savedResumes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiFileText size={32} className="text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Saved Resumes Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create your first professional resume using our builder. Choose from multiple templates and save your work for easy access.
            </p>
            <Link
              to="/builder"
              className="inline-flex items-center space-x-2 bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiPlus size={20} />
              <span>Create Your First Resume</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedResumes.map((resume) => (
              <div
                key={resume._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{resume.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTemplateColor(resume.template)}`}>
                        {resume.template.charAt(0).toUpperCase() + resume.template.slice(1)} Template
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiFileText className="text-primary-600" size={20} />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4">
                    <p>Last updated: {new Date(resume.updatedAt).toLocaleDateString()}</p>
                    <p>Created: {new Date(resume.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/builder?resumeId=${resume._id}`}
                      className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      <FiEdit2 size={16} />
                      <span>Edit Resume</span>
                    </Link>

                    <button
                      onClick={() => handleDownload(resume)}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <FiDownload size={16} />
                      <span>Download PDF</span>
                    </button>

                    <button
                      onClick={() => handleDelete(resume._id, resume.name)}
                      disabled={deletingId === resume._id}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 size={16} />
                      <span>{deletingId === resume._id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resume Management Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Save Multiple Versions</h3>
              <p className="text-gray-600 text-sm">
                Create different versions of your resume for various job applications, each tailored to specific roles or industries.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Regular Updates</h3>
              <p className="text-gray-600 text-sm">
                Keep your resume current with new skills, projects, and experiences. Regular updates improve your ATS scores.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedResumes;