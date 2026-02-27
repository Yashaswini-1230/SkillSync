import React, { useState } from 'react';
import { FiSave, FiDownload, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import TemplatePreview from '../components/TemplatePreview';

const ResumeBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [currentStep, setCurrentStep] = useState('template'); // 'template', 'preview', or 'edit'
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: ''
    },
    summary: '',
    skills: {
      technical: [],
      soft: []
    },
    experience: [],
    education: [],
    projects: [],
    certifications: []
  });

  const [newTechnicalSkill, setNewTechnicalSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [editingExp, setEditingExp] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [editingProj, setEditingProj] = useState(null);
  const [savedResumeId, setSavedResumeId] = useState(null);

  const templates = [
    {
      id: 'modern-professional',
      name: 'Modern Professional',
      description: 'Clean and contemporary design perfect for tech roles',
      preview: 'A sleek, modern layout with subtle colors and clean typography',
      features: ['Minimalist design', 'Perfect for tech roles', 'ATS-friendly']
    },
    {
      id: 'minimal-tech',
      name: 'Minimal Tech',
      description: 'Ultra-clean design focused on content and readability',
      preview: 'Simple, elegant layout that lets your experience shine',
      features: ['Ultra-minimalist', 'Content-focused', 'Highly readable']
    },
    {
      id: 'classic-ats',
      name: 'Classic ATS',
      description: 'Traditional format optimized for Applicant Tracking Systems',
      preview: 'Time-tested layout that ATS systems love to parse',
      features: ['ATS-optimized', 'Traditional format', 'Parser-friendly']
    },
    {
      id: 'two-column-professional',
      name: 'Two-Column Professional',
      description: 'Modern two-column layout for comprehensive resumes',
      preview: 'Efficient use of space with professional two-column design',
      features: ['Space-efficient', 'Professional layout', 'Comprehensive']
    },
    {
      id: 'creative',
      name: 'Creative (ATS-Safe)',
      description: 'Eye-catching design for creative roles while staying ATS-friendly',
      preview: 'Bold yet professional design that stands out safely',
      features: ['Creative design', 'ATS-compatible', 'Attention-grabbing']
    },
    {
      id: 'compact-fresher',
      name: 'Compact Fresher',
      description: 'Space-efficient template perfect for entry-level professionals',
      preview: 'Condensed yet comprehensive layout for fresh graduates',
      features: ['Space-efficient', 'Entry-level friendly', 'Compact design']
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Sophisticated template for senior-level professionals',
      preview: 'Elegant design that conveys authority and experience',
      features: ['Executive style', 'Sophisticated design', 'Leadership-focused']
    }
  ];

  const addTechnicalSkill = () => {
    if (newTechnicalSkill.trim()) {
      setResumeData({
        ...resumeData,
        skills: {
          ...resumeData.skills,
          technical: [...resumeData.skills.technical, newTechnicalSkill.trim()]
        }
      });
      setNewTechnicalSkill('');
    }
  };

  const addSoftSkill = () => {
    if (newSoftSkill.trim()) {
      setResumeData({
        ...resumeData,
        skills: {
          ...resumeData.skills,
          soft: [...resumeData.skills.soft, newSoftSkill.trim()]
        }
      });
      setNewSoftSkill('');
    }
  };

  const removeTechnicalSkill = (index) => {
    setResumeData({
      ...resumeData,
      skills: {
        ...resumeData.skills,
        technical: resumeData.skills.technical.filter((_, i) => i !== index)
      }
    });
  };

  const removeSoftSkill = (index) => {
    setResumeData({
      ...resumeData,
      skills: {
        ...resumeData.skills,
        soft: resumeData.skills.soft.filter((_, i) => i !== index)
      }
    });
  };

  const addExperience = () => {
    setEditingExp({ title: '', company: '', duration: '', description: '' });
  };

  const saveExperience = () => {
    if (editingExp.title && editingExp.company) {
      setResumeData({
        ...resumeData,
        experience: [...resumeData.experience, editingExp]
      });
      setEditingExp(null);
    }
  };

  const removeExperience = (index) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index)
    });
  };

  const addEducation = () => {
    setEditingEdu({
      degree: '',
      institution: '',
      startYear: '',
      endYear: '',
      gpa: ''
    });
  };

  const saveEducation = () => {
    if (editingEdu.degree && editingEdu.institution) {
      setResumeData({
        ...resumeData,
        education: [...resumeData.education, editingEdu]
      });
      setEditingEdu(null);
    }
  };

  const removeEducation = (index) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index)
    });
  };

  const addProject = () => {
    setEditingProj({
      name: '',
      description: '',
      technologies: [],
      startMonth: '',
      startYear: '',
      endMonth: '',
      endYear: '',
      isPresent: false
    });
  };

  const saveProject = () => {
    if (editingProj.name) {
      setResumeData({
        ...resumeData,
        projects: [...resumeData.projects, editingProj]
      });
      setEditingProj(null);
    }
  };

  const removeProject = (index) => {
    setResumeData({
      ...resumeData,
      projects: resumeData.projects.filter((_, i) => i !== index)
    });
  };

  const selectTemplate = (template) => {
    setPreviewTemplate(template);
    setCurrentStep('preview');
  };

  const confirmTemplate = () => {
    setSelectedTemplate(previewTemplate);
    setPreviewTemplate(null);
    setCurrentStep('edit');
  };

  const changeTemplate = () => {
    setPreviewTemplate(null);
    setCurrentStep('template');
  };

  const handleSave = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first');
      return;
    }

    // Prompt for resume name
    const resumeName = window.prompt('Enter a name for your resume:', `My Resume ${new Date().toLocaleDateString()}`);
    if (!resumeName || !resumeName.trim()) {
      toast.error('Resume name is required');
      return;
    }

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${API_URL}/saved-resumes`, {
        name: resumeName.trim(),
        template: selectedTemplate.id,
        resumeData
      });

      setSavedResumeId(response.data.resume.id);
      toast.success(`Resume "${resumeName}" saved successfully!`);
    } catch (error) {
      console.error('Error saving resume:', error);
      const message = error.response?.data?.message || 'Failed to save resume';
      toast.error(message);
    }
  };

  const handleDownload = async () => {
    if (!selectedTemplate) {
      toast.error('Please save your resume first before downloading');
      return;
    }

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    try {
      let resumeId = savedResumeId;
      let filenameBase = selectedTemplate.name;

      // If we don't have a saved ID yet, create one
      if (!resumeId) {
        const resumeName = window.prompt(
          'Enter a name for your resume:',
          `My Resume ${new Date().toLocaleDateString()}`
        );
        if (!resumeName || !resumeName.trim()) {
          toast.error('Resume name is required');
          return;
        }

        const saveResponse = await axios.post(`${API_URL}/saved-resumes`, {
          name: resumeName.trim(),
          template: selectedTemplate.id,
          resumeData
        });

        resumeId = saveResponse.data.resume.id;
        filenameBase = resumeName.trim();
        setSavedResumeId(resumeId);
        toast.success('Resume saved successfully! Generating PDF...');
      } else {
        // Update existing saved resume with latest data before downloading
        try {
          await axios.put(`${API_URL}/saved-resumes/${resumeId}`, {
            template: selectedTemplate.id,
            resumeData
          });
        } catch (updateError) {
          console.error('Error updating saved resume before download:', updateError);
        }
      }

      const downloadResponse = await axios.get(`${API_URL}/saved-resumes/${resumeId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filenameBase.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      const message = error.response?.data?.message || 'Failed to download PDF';
      toast.error(message);
    }
  };

  const goBackToTemplates = () => {
    setCurrentStep('template');
  };

  // Template Selection Step
  if (currentStep === 'template') {
    return (
      <div className="min-h-screen page-content pt-20 px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Resume Template</h1>
            <p className="text-lg text-gray-600">Select a professional template that matches your industry and style</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-primary-300"
                onClick={() => selectTemplate(template)}
              >
                <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-primary-600">{template.name[0]}</span>
                    </div>
                    <p className="text-sm text-gray-600">Template Preview</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="space-y-1">
                    {template.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
                    Preview Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Template Preview Step
  if (currentStep === 'preview' && previewTemplate) {
    return (
      <div className="min-h-screen page-content pt-20 px-4 py-8 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Template Preview</h1>
            <p className="text-lg text-gray-600">Review how your resume will look with the {previewTemplate.name} template</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Template Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">{previewTemplate.name[0]}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{previewTemplate.name}</h2>
                  <p className="text-gray-600">{previewTemplate.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <h3 className="font-semibold text-gray-900">Template Features:</h3>
                {previewTemplate.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button
                  onClick={confirmTemplate}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                  Continue with this Template
                </button>
                <button
                  onClick={changeTemplate}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Choose Different Template
                </button>
              </div>
            </div>

            {/* Resume Preview */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                <TemplatePreview template={previewTemplate} resumeData={resumeData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Edit Step
  return (
    <div className="min-h-screen page-content pt-20 px-4 sm:px-6 lg:px-8 py-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={goBackToTemplates}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
            >
              ← Change Template
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
              <p className="text-sm text-gray-600">Using: {selectedTemplate?.name}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiSave size={20} />
              <span>Save</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FiDownload size={20} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={resumeData.personalInfo.name}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, name: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="LinkedIn URL"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="text"
                  placeholder="GitHub URL"
                  value={resumeData.personalInfo.github}
                  onChange={(e) =>
                    setResumeData({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, github: e.target.value }
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <textarea
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                placeholder="Write a brief professional summary..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>

              {/* Technical Skills */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Technical Skills</h3>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newTechnicalSkill}
                    onChange={(e) => setNewTechnicalSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTechnicalSkill()}
                    placeholder="e.g., JavaScript, Python, React"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={addTechnicalSkill}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <FiPlus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.technical.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      <button onClick={() => removeTechnicalSkill(idx)} className="hover:text-red-600">
                        <FiTrash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Soft Skills</h3>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSoftSkill()}
                    placeholder="e.g., Communication, Leadership, Problem Solving"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={addSoftSkill}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <FiPlus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.soft.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center space-x-2"
                    >
                      <span>{skill}</span>
                      <button onClick={() => removeSoftSkill(idx)} className="hover:text-red-600">
                        <FiTrash2 size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Experience</h2>
                <button
                  onClick={addExperience}
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <FiPlus size={20} />
                  <span>Add</span>
                </button>
              </div>
              {editingExp && (
                <div className="mb-4 p-4 border border-gray-300 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={editingExp.title}
                    onChange={(e) => setEditingExp({ ...editingExp, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={editingExp.company}
                    onChange={(e) => setEditingExp({ ...editingExp, company: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={editingExp.duration}
                    onChange={(e) => setEditingExp({ ...editingExp, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    placeholder="Description"
                    value={editingExp.description}
                    onChange={(e) => setEditingExp({ ...editingExp, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={saveExperience}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingExp(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {resumeData.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                      <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                    </div>
                    <button
                      onClick={() => removeExperience(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Education</h2>
                <button
                  onClick={addEducation}
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <FiPlus size={20} />
                  <span>Add</span>
                </button>
              </div>
              {editingEdu && (
                <div className="mb-4 p-4 border border-gray-300 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Degree (e.g., Bachelor of Science in Computer Science)"
                    value={editingEdu.degree}
                    onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Institution (e.g., University of California)"
                    value={editingEdu.institution}
                    onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Start Year (e.g., 2020)"
                      value={editingEdu.startYear}
                      onChange={(e) => setEditingEdu({ ...editingEdu, startYear: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="End Year (e.g., 2024 or Present)"
                      value={editingEdu.endYear}
                      onChange={(e) => setEditingEdu({ ...editingEdu, endYear: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="GPA (optional, e.g., 3.8/4.0)"
                    value={editingEdu.gpa}
                    onChange={(e) => setEditingEdu({ ...editingEdu, gpa: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={saveEducation}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingEdu(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {resumeData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {edu.startYear} - {edu.endYear || 'Present'}
                        {edu.gpa && ` • GPA: ${edu.gpa}`}
                      </p>
                    </div>
                    <button
                      onClick={() => removeEducation(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Projects</h2>
                <button
                  onClick={addProject}
                  className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                >
                  <FiPlus size={20} />
                  <span>Add</span>
                </button>
              </div>
              {editingProj && (
                <div className="mb-4 p-4 border border-gray-300 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={editingProj.name}
                    onChange={(e) => setEditingProj({ ...editingProj, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <textarea
                    placeholder="Description"
                    value={editingProj.description}
                    onChange={(e) => setEditingProj({ ...editingProj, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  {/* Project Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Duration</label>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Start Month/Year</label>
                        <div className="flex space-x-2">
                          <select
                            value={editingProj.startMonth}
                            onChange={(e) => setEditingProj({ ...editingProj, startMonth: e.target.value })}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm"
                          >
                            <option value="">Month</option>
                            <option value="Jan">Jan</option>
                            <option value="Feb">Feb</option>
                            <option value="Mar">Mar</option>
                            <option value="Apr">Apr</option>
                            <option value="May">May</option>
                            <option value="Jun">Jun</option>
                            <option value="Jul">Jul</option>
                            <option value="Aug">Aug</option>
                            <option value="Sep">Sep</option>
                            <option value="Oct">Oct</option>
                            <option value="Nov">Nov</option>
                            <option value="Dec">Dec</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Year"
                            value={editingProj.startYear}
                            onChange={(e) => setEditingProj({ ...editingProj, startYear: e.target.value })}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">End Month/Year</label>
                        <div className="flex space-x-2">
                          <select
                            value={editingProj.endMonth}
                            onChange={(e) => setEditingProj({ ...editingProj, endMonth: e.target.value })}
                            disabled={editingProj.isPresent}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                          >
                            <option value="">Month</option>
                            <option value="Jan">Jan</option>
                            <option value="Feb">Feb</option>
                            <option value="Mar">Mar</option>
                            <option value="Apr">Apr</option>
                            <option value="May">May</option>
                            <option value="Jun">Jun</option>
                            <option value="Jul">Jul</option>
                            <option value="Aug">Aug</option>
                            <option value="Sep">Sep</option>
                            <option value="Oct">Oct</option>
                            <option value="Nov">Nov</option>
                            <option value="Dec">Dec</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Year"
                            value={editingProj.endYear}
                            onChange={(e) => setEditingProj({ ...editingProj, endYear: e.target.value })}
                            disabled={editingProj.isPresent}
                            className="flex-1 px-2 py-2 border border-gray-300 rounded text-sm disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="project-present"
                        checked={editingProj.isPresent}
                        onChange={(e) => setEditingProj({ ...editingProj, isPresent: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="project-present" className="text-sm text-gray-700">Currently working on this project</label>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={saveProject}
                      className="flex-1 bg-primary-600 text-white py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingProj(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {resumeData.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-lg flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{proj.name}</h3>
                      <p className="text-sm text-gray-500 mb-1">
                        {proj.startMonth && proj.startYear ? `${proj.startMonth} ${proj.startYear}` : ''}
                        {proj.startMonth && proj.startYear && (proj.endMonth || proj.endYear || proj.isPresent) ? ' - ' : ''}
                        {proj.isPresent ? 'Present' : (proj.endMonth && proj.endYear ? `${proj.endMonth} ${proj.endYear}` : '')}
                      </p>
                      <p className="text-sm text-gray-700">{proj.description}</p>
                    </div>
                    <button
                      onClick={() => removeProject(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl shadow-md p-4 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Preview</h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <TemplatePreview template={selectedTemplate} resumeData={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
