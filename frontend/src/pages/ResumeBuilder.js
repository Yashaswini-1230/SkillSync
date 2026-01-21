import React, { useState } from 'react';
import { FiSave, FiDownload, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ResumeBuilder = () => {
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
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [editingExp, setEditingExp] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [editingProj, setEditingProj] = useState(null);

  const addSkill = () => {
    if (newSkill.trim()) {
      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index)
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
    setEditingEdu({ degree: '', institution: '', year: '' });
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
    setEditingProj({ name: '', description: '', technologies: [] });
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

  const handleSave = () => {
    toast.success('Resume saved! (Note: This is a demo - implement backend save functionality)');
  };

  const handleDownload = () => {
    toast.success('Downloading resume... (Note: Implement PDF generation)');
  };

  return (
    <div className="min-h-screen pt-16 md:ml-64 px-4 py-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
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
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Add skill"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={addSkill}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiPlus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{skill}</span>
                    <button onClick={() => removeSkill(idx)} className="hover:text-red-600">
                      <FiTrash2 size={14} />
                    </button>
                  </span>
                ))}
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
                    placeholder="Degree"
                    value={editingEdu.degree}
                    onChange={(e) => setEditingEdu({ ...editingEdu, degree: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Institution"
                    value={editingEdu.institution}
                    onChange={(e) => setEditingEdu({ ...editingEdu, institution: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Year"
                    value={editingEdu.year}
                    onChange={(e) => setEditingEdu({ ...editingEdu, year: e.target.value })}
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
                      <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
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
                      <p className="text-sm text-gray-700 mt-1">{proj.description}</p>
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
          <div className="bg-white rounded-xl shadow-md p-8 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Preview</h2>
            <div className="resume-preview space-y-6">
              <div>
                <h1 className="text-3xl font-bold">{resumeData.personalInfo.name || 'Your Name'}</h1>
                <div className="text-gray-600 mt-2">
                  {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                  {resumeData.personalInfo.phone && <span className="mx-2">•</span>}
                  {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                </div>
              </div>

              {resumeData.summary && (
                <div>
                  <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-2">Summary</h2>
                  <p className="text-gray-700">{resumeData.summary}</p>
                </div>
              )}

              {resumeData.skills.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-2">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {resumeData.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resumeData.experience.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-2">Experience</h2>
                  {resumeData.experience.map((exp, idx) => (
                    <div key={idx} className="mb-4">
                      <h3 className="font-semibold">{exp.title}</h3>
                      <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                      <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {resumeData.education.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-2">Education</h2>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                    </div>
                  ))}
                </div>
              )}

              {resumeData.projects.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-2">Projects</h2>
                  {resumeData.projects.map((proj, idx) => (
                    <div key={idx} className="mb-2">
                      <h3 className="font-semibold">{proj.name}</h3>
                      <p className="text-sm text-gray-700">{proj.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
