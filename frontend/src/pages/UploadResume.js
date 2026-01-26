import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUpload, FiTrash2, FiFile, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

const UploadResume = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API_URL}/resumes`);
      setResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc)$/i)) {
      toast.error('Only PDF and DOCX files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    await uploadFile(selectedFile);
    setSelectedFile(null);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      await axios.post(`${API_URL}/resumes/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Resume uploaded successfully!');
      fetchResumes();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload resume';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await axios.delete(`${API_URL}/resumes/${resumeId}`);
      toast.success('Resume deleted successfully');
      fetchResumes();
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Resume</h1>

        {/* Upload Area */}
        <div className="space-y-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-primary-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.doc"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <FiUpload size={32} className="text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {uploading ? 'Uploading...' : 'Select your resume file'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Choose a PDF or DOCX file (up to 10MB)
                </p>
                {!uploading && (
                  <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Browse Files
                  </button>
                )}
              </div>
            </label>
          </div>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiFile className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-sm text-blue-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB • Ready to upload
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-500 hover:text-gray-700 p-2"
                    title="Remove file"
                  >
                    ✕
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload Resume'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumes List */}
        {resumes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Resumes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <FiFile className="text-primary-600" size={20} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 truncate max-w-xs">
                          {resume.originalName}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                          <FiCalendar size={14} />
                          <span>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(resume._id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    {(resume.fileSize / 1024).toFixed(2)} KB
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resumes.length === 0 && !loading && (
          <div className="mt-8 bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-600">No resumes uploaded yet. Upload your first resume above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadResume;
