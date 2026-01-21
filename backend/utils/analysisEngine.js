const natural = require('natural');
const nlp = require('compromise');

/**
 * Calculate TF-IDF vectors for text
 */
function calculateTFIDF(text, allDocuments) {
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();
  
  allDocuments.forEach(doc => tfidf.addDocument(doc));
  
  const vector = {};
  tfidf.listTerms(0).forEach(item => {
    vector[item.term] = item.tfidf;
  });
  
  return vector;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  keys.forEach(key => {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  });

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Extract skills using NER and phrase matching
 */
function extractSkills(text) {
  const skills = [];
  const lowerText = text.toLowerCase();
  
  // Technical skills database
  const technicalSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
    'git', 'github', 'gitlab', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui',
    'machine learning', 'deep learning', 'ai', 'nlp', 'data science',
    'frontend', 'backend', 'full stack', 'devops', 'microservices',
    'rest api', 'graphql', 'websocket', 'tcp/ip', 'http/https'
  ];

  // Extract skills using phrase matching
  technicalSkills.forEach(skill => {
    if (lowerText.includes(skill)) {
      skills.push(skill);
    }
  });

  // Use NLP to extract noun phrases that might be skills
  const doc = nlp(text);
  const nouns = doc.nouns().out('array');
  nouns.forEach(noun => {
    const lowerNoun = noun.toLowerCase();
    if (lowerNoun.length > 3 && !skills.includes(lowerNoun)) {
      // Check if it's a technical term
      if (technicalSkills.some(skill => lowerNoun.includes(skill) || skill.includes(lowerNoun))) {
        skills.push(lowerNoun);
      }
    }
  });

  return [...new Set(skills)]; // Remove duplicates
}

/**
 * Detect missing sections in resume
 */
function detectMissingSections(resumeText, parsedData) {
  const missing = [];
  const lowerText = resumeText.toLowerCase();

  if (!parsedData.summary && !lowerText.includes('summary') && !lowerText.includes('objective')) {
    missing.push('Professional Summary');
  }
  if (!parsedData.experience || parsedData.experience.length === 0) {
    missing.push('Work Experience');
  }
  if (!parsedData.education || parsedData.education.length === 0) {
    missing.push('Education');
  }
  if (!parsedData.skills || parsedData.skills.length === 0) {
    missing.push('Skills');
  }
  if (!parsedData.projects || parsedData.projects.length === 0) {
    missing.push('Projects');
  }

  return missing;
}

/**
 * Check grammar and spelling (basic implementation)
 */
function checkGrammar(text) {
  const issues = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());

  sentences.forEach((sentence, index) => {
    const trimmed = sentence.trim();
    if (trimmed.length > 0) {
      // Check for common issues
      if (!trimmed[0].match(/[A-Z]/)) {
        issues.push({
          text: trimmed,
          suggestion: 'Sentence should start with a capital letter',
          severity: 'low'
        });
      }
      if (trimmed.length < 10) {
        issues.push({
          text: trimmed,
          suggestion: 'Sentence seems too short, consider expanding',
          severity: 'low'
        });
      }
    }
  });

  return issues;
}

/**
 * Main analysis function
 */
function analyzeResume(resumeText, parsedData, jobDescription, jobRole) {
  // Extract skills from both resume and JD
  const resumeSkills = extractSkills(resumeText);
  const jdSkills = extractSkills(jobDescription);

  // Calculate semantic similarity
  const allDocs = [resumeText, jobDescription];
  const resumeVector = calculateTFIDF(resumeText, allDocs);
  const jdVector = calculateTFIDF(jobDescription, allDocs);
  const similarity = cosineSimilarity(resumeVector, jdVector);

  // Find matching and missing skills
  const matchingSkills = resumeSkills.filter(skill => 
    jdSkills.some(jdSkill => 
      skill.includes(jdSkill) || jdSkill.includes(skill)
    )
  );
  const missingSkills = jdSkills.filter(skill => 
    !resumeSkills.some(resumeSkill => 
      skill.includes(resumeSkill) || resumeSkill.includes(skill)
    )
  );

  // Calculate ATS score (0-100)
  const skillMatchRatio = jdSkills.length > 0 ? matchingSkills.length / jdSkills.length : 0;
  const atsScore = Math.round(
    (similarity * 40) + // Semantic similarity (40%)
    (skillMatchRatio * 40) + // Skill matching (40%)
    (parsedData.experience?.length > 0 ? 10 : 0) + // Has experience (10%)
    (parsedData.education?.length > 0 ? 10 : 0) // Has education (10%)
  );

  // Detect missing sections
  const missingSections = detectMissingSections(resumeText, parsedData);

  // Check grammar
  const grammarIssues = checkGrammar(resumeText);

  // Generate suggestions
  const suggestions = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Consider adding these skills: ${missingSkills.slice(0, 5).join(', ')}`);
  }
  if (missingSections.length > 0) {
    suggestions.push(`Add missing sections: ${missingSections.join(', ')}`);
  }
  if (atsScore < 70) {
    suggestions.push('Improve keyword matching with job description');
  }
  if (parsedData.summary && parsedData.summary.length < 50) {
    suggestions.push('Expand your professional summary');
  }

  // Calculate job role fit
  const jobRoleFit = Math.round(
    (similarity * 50) + (skillMatchRatio * 50)
  );

  return {
    atsScore: Math.min(100, Math.max(0, atsScore)),
    matchingSkills: [...new Set(matchingSkills)],
    missingSkills: [...new Set(missingSkills)],
    missingSections,
    grammarIssues,
    suggestions,
    jobRoleFit: Math.min(100, Math.max(0, jobRoleFit))
  };
}

module.exports = {
  analyzeResume,
  extractSkills,
  cosineSimilarity
};
