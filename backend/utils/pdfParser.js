const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Error parsing PDF: ${error.message}`);
  }
}

/**
 * Extract text from DOCX file
 */
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Error parsing DOCX: ${error.message}`);
  }
}

/**
 * Parse resume text and extract structured data
 */
function parseResumeText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const parsed = {
    name: '',
    email: '',
    phone: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: []
  };

  // Extract email
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const emails = text.match(emailRegex);
  if (emails) parsed.email = emails[0];

  // Extract phone
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = text.match(phoneRegex);
  if (phones) parsed.phone = phones[0];

  // Extract name (usually first line or before email)
  if (lines.length > 0) {
    parsed.name = lines[0];
  }

  // Extract skills (common keywords)
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'express', 'mongodb',
    'sql', 'html', 'css', 'typescript', 'angular', 'vue', 'aws', 'docker',
    'kubernetes', 'git', 'agile', 'scrum', 'machine learning', 'ai',
    'data analysis', 'frontend', 'backend', 'full stack', 'devops'
  ];
  
  const lowerText = text.toLowerCase();
  skillKeywords.forEach(skill => {
    if (lowerText.includes(skill)) {
      parsed.skills.push(skill);
    }
  });

  // Extract sections (basic parsing)
  let currentSection = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (line.includes('summary') || line.includes('objective') || line.includes('about')) {
      currentSection = 'summary';
      continue;
    }
    if (line.includes('experience') || line.includes('work history')) {
      currentSection = 'experience';
      continue;
    }
    if (line.includes('education')) {
      currentSection = 'education';
      continue;
    }
    if (line.includes('project')) {
      currentSection = 'projects';
      continue;
    }
    if (line.includes('certification') || line.includes('certificate')) {
      currentSection = 'certifications';
      continue;
    }

    if (currentSection === 'summary' && !parsed.summary) {
      parsed.summary = lines[i];
    }
  }

  return parsed;
}

/**
 * Main function to extract text from resume file
 */
async function extractResumeText(filePath, fileType) {
  let text = '';
  
  if (fileType === 'application/pdf') {
    text = await extractTextFromPDF(filePath);
  } else if (fileType.includes('wordprocessingml') || fileType.includes('msword') || filePath.endsWith('.docx')) {
    text = await extractTextFromDOCX(filePath);
  } else {
    throw new Error('Unsupported file type');
  }

  const parsedData = parseResumeText(text);
  
  return {
    text,
    parsedData
  };
}

module.exports = {
  extractResumeText,
  parseResumeText
};
