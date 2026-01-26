import React from 'react';

const TemplatePreview = ({ template, resumeData }) => {
  const renderTemplate = () => {
    switch (template.id) {
      case 'modern-professional':
        return <ModernProfessionalTemplate resumeData={resumeData} />;
      case 'minimal-tech':
        return <MinimalTechTemplate resumeData={resumeData} />;
      case 'classic-ats':
        return <ClassicATSTemplate resumeData={resumeData} />;
      case 'two-column-professional':
        return <TwoColumnProfessionalTemplate resumeData={resumeData} />;
      case 'creative':
        return <CreativeTemplate resumeData={resumeData} />;
      case 'compact-fresher':
        return <CompactFresherTemplate resumeData={resumeData} />;
      case 'executive':
        return <ExecutiveTemplate resumeData={resumeData} />;
      default:
        return <ModernProfessionalTemplate resumeData={resumeData} />;
    }
  };

  return (
    <div className="resume-preview-container">
      {renderTemplate()}
    </div>
  );
};

// Modern Professional Template
const ModernProfessionalTemplate = ({ resumeData }) => (
  <div className="bg-white text-gray-900 p-6 max-w-4xl mx-auto shadow-lg">
    {/* Header */}
    <div className="border-b-2 border-blue-600 pb-4 mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {resumeData.personalInfo.name || 'Your Name'}
      </h1>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.address && <span>• {resumeData.personalInfo.address}</span>}
      </div>
      <div className="flex flex-wrap gap-4 text-sm text-blue-600 mt-1">
        {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
        {resumeData.personalInfo.github && <span>• {resumeData.personalInfo.github}</span>}
      </div>
    </div>

    {/* Summary */}
    {resumeData.summary && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-2 uppercase tracking-wide">Professional Summary</h2>
        <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
      </div>
    )}

    {/* Skills */}
    {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resumeData.skills.technical.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.technical.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {resumeData.skills.soft.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Soft Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.soft.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Experience */}
    {resumeData.experience.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">Experience</h2>
        {resumeData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="font-semibold text-gray-900">{exp.title}</h3>
            <p className="text-blue-600 font-medium">{exp.company} • {exp.duration}</p>
            <p className="text-gray-700 mt-2 text-sm leading-relaxed">{exp.description}</p>
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {resumeData.education.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">Education</h2>
        {resumeData.education.map((edu, idx) => (
          <div key={idx} className="mb-3">
            <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
            <p className="text-gray-600">{edu.institution}</p>
            <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear || 'Present'} {edu.gpa && `• GPA: ${edu.gpa}`}</p>
          </div>
        ))}
      </div>
    )}

    {/* Projects */}
    {resumeData.projects.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-blue-600 mb-3 uppercase tracking-wide">Projects</h2>
        {resumeData.projects.map((proj, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="font-semibold text-gray-900">{proj.name}</h3>
            <p className="text-sm text-gray-500 mb-1">
              {proj.startMonth && proj.startYear ? `${proj.startMonth} ${proj.startYear}` : ''}
              {proj.startMonth && proj.startYear && (proj.endMonth || proj.endYear || proj.isPresent) ? ' - ' : ''}
              {proj.isPresent ? 'Present' : (proj.endMonth && proj.endYear ? `${proj.endMonth} ${proj.endYear}` : '')}
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">{proj.description}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

// Minimal Tech Template
const MinimalTechTemplate = ({ resumeData }) => (
  <div className="bg-white text-gray-900 p-6 max-w-4xl mx-auto">
    {/* Header */}
    <div className="text-center mb-8">
      <h1 className="text-4xl font-light text-gray-900 mb-2">
        {resumeData.personalInfo.name || 'Your Name'}
      </h1>
      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
      </div>
      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 mt-1">
        {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
        {resumeData.personalInfo.github && <span>• {resumeData.personalInfo.github}</span>}
      </div>
    </div>

    {/* Content sections with minimal styling */}
    <div className="space-y-8">
      {resumeData.summary && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </div>
      )}

      {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.technical.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                {skill}
              </span>
            ))}
            {resumeData.skills.soft.map((skill, idx) => (
              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {resumeData.experience.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">Experience</h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4">
              <h3 className="font-medium text-gray-900">{exp.title}</h3>
              <p className="text-gray-600 text-sm">{exp.company} • {exp.duration}</p>
              <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {resumeData.education.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">Education</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-medium text-gray-900">{edu.degree}</h3>
              <p className="text-gray-600 text-sm">{edu.institution}</p>
              <p className="text-gray-500 text-sm">{edu.startYear} - {edu.endYear || 'Present'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Classic ATS Template
const ClassicATSTemplate = ({ resumeData }) => (
  <div className="bg-white text-gray-900 p-6 max-w-4xl mx-auto font-serif">
    {/* Header */}
    <div className="text-center mb-8 pb-4 border-b-2 border-black">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {resumeData.personalInfo.name || 'Your Name'}
      </h1>
      <div className="text-sm text-gray-700">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span className="mx-2">|</span>}
        {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.address && <span className="mx-2">|</span>}
        {resumeData.personalInfo.address && <span>{resumeData.personalInfo.address}</span>}
      </div>
    </div>

    {/* Summary */}
    {resumeData.summary && (
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-2 uppercase">Professional Summary</h2>
        <p className="text-gray-700 text-sm leading-relaxed">{resumeData.summary}</p>
      </div>
    )}

    {/* Skills */}
    {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-2 uppercase">Skills</h2>
        <div className="text-sm text-gray-700">
          <strong>Technical:</strong> {resumeData.skills.technical.join(', ')}
          {resumeData.skills.soft.length > 0 && (
            <>
              <br />
              <strong>Soft:</strong> {resumeData.skills.soft.join(', ')}
            </>
          )}
        </div>
      </div>
    )}

    {/* Experience */}
    {resumeData.experience.length > 0 && (
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3 uppercase">Professional Experience</h2>
        {resumeData.experience.map((exp, idx) => (
          <div key={idx} className="mb-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold text-gray-900 text-sm">{exp.title}</h3>
              <span className="text-xs text-gray-600">{exp.duration}</span>
            </div>
            <p className="text-gray-700 font-medium text-sm mb-1">{exp.company}</p>
            <p className="text-gray-700 text-xs leading-relaxed">{exp.description}</p>
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {resumeData.education.length > 0 && (
      <div className="mb-6">
        <h2 className="text-base font-bold text-gray-900 mb-3 uppercase">Education</h2>
        {resumeData.education.map((edu, idx) => (
          <div key={idx} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                <p className="text-gray-700 text-sm">{edu.institution}</p>
              </div>
              <span className="text-xs text-gray-600">{edu.startYear} - {edu.endYear || 'Present'}</span>
            </div>
            {edu.gpa && <p className="text-xs text-gray-600 mt-1">GPA: {edu.gpa}</p>}
          </div>
        ))}
      </div>
    )}
  </div>
);

// Two Column Professional Template
const TwoColumnProfessionalTemplate = ({ resumeData }) => (
  <div className="bg-white text-gray-900 p-6 max-w-5xl mx-auto">
    <div className="grid grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="col-span-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {resumeData.personalInfo.name || 'Your Name'}
          </h1>
          <div className="space-y-2 text-sm text-gray-600">
            {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
            {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
            {resumeData.personalInfo.linkedin && <div>{resumeData.personalInfo.linkedin}</div>}
            {resumeData.personalInfo.github && <div>{resumeData.personalInfo.github}</div>}
          </div>
        </div>

        {/* Skills */}
        {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
            <div className="space-y-3">
              {resumeData.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">Technical</h3>
                  <div className="flex flex-wrap gap-1">
                    {resumeData.skills.technical.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {resumeData.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800 mb-2 text-sm">Soft Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {resumeData.skills.soft.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="col-span-2">
        {/* Summary */}
        {resumeData.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed text-sm">{resumeData.summary}</p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{exp.company} • {exp.duration}</p>
                <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-600 text-sm">{edu.institution}</p>
                <p className="text-gray-500 text-xs">{edu.startYear} - {edu.endYear || 'Present'} {edu.gpa && `• GPA: ${edu.gpa}`}</p>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resumeData.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Projects</h2>
            {resumeData.projects.map((proj, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="font-semibold text-gray-900">{proj.name}</h3>
                <p className="text-gray-500 text-xs mb-1">
                  {proj.startMonth && proj.startYear ? `${proj.startMonth} ${proj.startYear}` : ''}
                  {proj.startMonth && proj.startYear && (proj.endMonth || proj.endYear || proj.isPresent) ? ' - ' : ''}
                  {proj.isPresent ? 'Present' : (proj.endMonth && proj.endYear ? `${proj.endMonth} ${proj.endYear}` : '')}
                </p>
                <p className="text-gray-700 text-sm">{proj.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Creative Template
const CreativeTemplate = ({ resumeData }) => (
  <div className="bg-gradient-to-br from-purple-50 to-blue-50 text-gray-900 p-6 max-w-4xl mx-auto rounded-lg">
    {/* Header */}
    <div className="text-center mb-8">
      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-bold text-xl">
          {(resumeData.personalInfo.name || 'Your Name').charAt(0)}
        </span>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {resumeData.personalInfo.name || 'Your Name'}
      </h1>
      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
      </div>
    </div>

    {/* Content */}
    <div className="space-y-6">
      {resumeData.summary && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-purple-600 mb-2">About Me</h2>
          <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
        </div>
      )}

      {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-purple-600 mb-3">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.technical.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
            {resumeData.skills.soft.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {resumeData.experience.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-purple-600 mb-3">Experience</h2>
          {resumeData.experience.map((exp, idx) => (
            <div key={idx} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 last:mb-0">
              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
              <p className="text-purple-600 font-medium text-sm">{exp.company} • {exp.duration}</p>
              <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
            </div>
          ))}
        </div>
      )}

      {resumeData.education.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-purple-600 mb-3">Education</h2>
          {resumeData.education.map((edu, idx) => (
            <div key={idx} className="mb-3">
              <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
              <p className="text-gray-600 text-sm">{edu.institution}</p>
              <p className="text-gray-500 text-xs">{edu.startYear} - {edu.endYear || 'Present'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// Compact Fresher Template
const CompactFresherTemplate = ({ resumeData }) => (
  <div className="bg-white text-gray-900 p-4 max-w-3xl mx-auto text-sm">
    {/* Header */}
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {resumeData.personalInfo.name || 'Your Name'}
      </h1>
      <div className="text-xs text-gray-600 space-y-1">
        {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
        {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
        <div className="flex justify-center gap-4">
          {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
          {resumeData.personalInfo.github && <span>{resumeData.personalInfo.github}</span>}
        </div>
      </div>
    </div>

    {/* Content in two columns */}
    <div className="grid grid-cols-2 gap-6">
      <div>
        {/* Summary */}
        {resumeData.summary && (
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900 mb-2">Summary</h2>
            <p className="text-gray-700 text-xs leading-relaxed">{resumeData.summary}</p>
          </div>
        )}

        {/* Skills */}
        {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900 mb-2">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {resumeData.skills.technical.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                  {skill}
                </span>
              ))}
              {resumeData.skills.soft.map((skill, idx) => (
                <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        {/* Experience */}
        {resumeData.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900 mb-2">Experience</h2>
            {resumeData.experience.map((exp, idx) => (
              <div key={idx} className="mb-3">
                <h3 className="font-medium text-gray-900 text-xs">{exp.title}</h3>
                <p className="text-gray-600 text-xs">{exp.company} • {exp.duration}</p>
                <p className="text-gray-700 text-xs mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {resumeData.education.length > 0 && (
          <div>
            <h2 className="font-semibold text-gray-900 mb-2">Education</h2>
            {resumeData.education.map((edu, idx) => (
              <div key={idx} className="mb-2">
                <h3 className="font-medium text-gray-900 text-xs">{edu.degree}</h3>
                <p className="text-gray-600 text-xs">{edu.institution}</p>
                <p className="text-gray-500 text-xs">{edu.startYear} - {edu.endYear || 'Present'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Executive Template
const ExecutiveTemplate = ({ resumeData }) => (
  <div className="bg-white text-gray-900 p-6 max-w-4xl mx-auto">
    {/* Header */}
    <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        {resumeData.personalInfo.name || 'Your Name'}
      </h1>
      <div className="text-lg text-gray-700 mb-2 font-medium">
        Executive Professional
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.linkedin && <span>{resumeData.personalInfo.linkedin}</span>}
      </div>
    </div>

    {/* Summary */}
    {resumeData.summary && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Executive Summary</h2>
        <p className="text-gray-700 leading-relaxed text-base">{resumeData.summary}</p>
      </div>
    )}

    {/* Skills */}
    {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Core Competencies</h2>
        <div className="grid grid-cols-2 gap-4">
          {resumeData.skills.technical.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Technical Leadership</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.technical.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {resumeData.skills.soft.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Executive Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.soft.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Experience */}
    {resumeData.experience.length > 0 && (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Professional Experience</h2>
        {resumeData.experience.map((exp, idx) => (
          <div key={idx} className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
              <span className="text-sm text-gray-600 font-medium">{exp.duration}</span>
            </div>
            <p className="text-gray-700 font-semibold mb-3">{exp.company}</p>
            <p className="text-gray-700 leading-relaxed">{exp.description}</p>
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {resumeData.education.length > 0 && (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Education</h2>
        {resumeData.education.map((edu, idx) => (
          <div key={idx} className="mb-4">
            <h3 className="font-bold text-gray-900">{edu.degree}</h3>
            <p className="text-gray-700 font-medium">{edu.institution}</p>
            <p className="text-gray-600">{edu.startYear} - {edu.endYear || 'Present'} {edu.gpa && `• GPA: ${edu.gpa}`}</p>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TemplatePreview;