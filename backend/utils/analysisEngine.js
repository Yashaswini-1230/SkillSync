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

  // Calculate keyword density for analysis
  const resumeWordCount = resumeText.split(/\s+/).length;
  const keywordDensity = jdSkills.reduce((count, skill) => {
    const regex = new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return count + (resumeText.match(regex) || []).length;
  }, 0);
  const densityRatio = keywordDensity / resumeWordCount;

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

  // Calculate ATS score (0-100) - Realistic algorithm
  const skillMatchRatio = jdSkills.length > 0 ? matchingSkills.length / jdSkills.length : 0;

  // Base scores with realistic caps (never perfect)
  const semanticScore = Math.min(similarity * 100, 70); // Max 70% for semantic similarity
  const skillScore = Math.min(skillMatchRatio * 100, 75); // Max 75% for skill matching
  const experienceScore = parsedData.experience?.length > 0 ? 6 : 0; // Experience bonus
  const educationScore = parsedData.education?.length > 0 ? 5 : 0; // Education bonus

  // Section completeness bonus (max 8 points)
  let sectionBonus = 0;
  if (parsedData.summary && parsedData.summary.length > 50) sectionBonus += 2;
  if (parsedData.projects && parsedData.projects.length > 0) sectionBonus += 2;
  if (parsedData.certifications && parsedData.certifications.length > 0) sectionBonus += 1;
  if (parsedData.skills && Array.isArray(parsedData.skills) && parsedData.skills.length > 3) sectionBonus += 3;

  // Advanced formatting and content penalties
  let formattingPenalty = 0;

  // Length penalties
  if (resumeWordCount < 150) formattingPenalty += 8; // Too short
  if (resumeWordCount > 800) formattingPenalty += 5; // Too long

  // Keyword stuffing detection
  if (densityRatio > 0.03) formattingPenalty += Math.min(densityRatio * 200, 15); // Max 15 point penalty

  // Missing contact information penalty
  if (!parsedData.email) formattingPenalty += 3;
  if (!parsedData.phone) formattingPenalty += 2;

  // Poor section structure penalty
  const hasProperSections = resumeText.toLowerCase().includes('experience') &&
                           resumeText.toLowerCase().includes('education') &&
                           resumeText.toLowerCase().includes('skills');
  if (!hasProperSections) formattingPenalty += 5;

  // Over-optimization penalty (too many exact keyword matches)
  const exactMatches = jdSkills.filter(skill =>
    resumeText.toLowerCase().includes(skill.toLowerCase())
  ).length;
  if (exactMatches > jdSkills.length * 0.8) formattingPenalty += 5; // Penalize over-optimization

  // Calculate weighted score
  const rawScore = (semanticScore * 0.25) + // 25% semantic similarity
                   (skillScore * 0.35) +   // 35% skill matching
                   (experienceScore * 0.15) + // 15% experience
                   (educationScore * 0.1) +  // 10% education
                   (sectionBonus * 0.15);    // 15% section completeness

  // Apply penalties and realistic caps
  const finalScore = Math.max(15, Math.min(88, rawScore - formattingPenalty)); // Min 15%, Max 88%

  const atsScore = Math.round(finalScore);

  // Detect missing sections
  const missingSections = detectMissingSections(resumeText, parsedData);

  // Check grammar
  const grammarIssues = checkGrammar(resumeText);

  // Calculate job role fit (used in suggestions and final output)
  const jobRoleFit = Math.round(
    (similarity * 50) + (skillMatchRatio * 50)
  );

  // Generate detailed, resume-aware suggestions
  const suggestions = [];

  const displayedMatching = matchingSkills.slice(0, 5);
  const displayedMissing = missingSkills.slice(0, 5);

  // High‑level fit summary
  suggestions.push(
    `For the "${jobRole}" role, your resume currently shows an overall ATS compatibility score of ${Math.round(atsScore)}% and a role fit of ${jobRoleFit}%.`
  );

  if (displayedMatching.length > 0) {
    suggestions.push(
      `Your resume already highlights key ${jobRole} skills such as ${displayedMatching.join(', ')}. Make sure these appear prominently in your Experience and Projects sections with concrete achievements.`
    );
  }

  // Skill‑level gaps tied to the job description
  if (displayedMissing.length > 0) {
    suggestions.push(
      `The job description emphasizes skills like ${displayedMissing.join(', ')} that are weak or missing in your resume. Add them only where you genuinely have experience, ideally inside bullet points under relevant roles or projects.`
    );
    if (missingSkills.length > displayedMissing.length) {
      suggestions.push(
        `There are an additional ${missingSkills.length - displayedMissing.length} JD skills not clearly reflected in your resume—scan the job description and mirror its exact phrasing where it genuinely matches your background.`
      );
    }
  }

  // Section‑level structure feedback
  if (missingSections.length > 0) {
    suggestions.push(
      `Your resume is missing important sections (${missingSections.join(', ')}). Add dedicated headings using standard titles so ATS can recognize them (for example: "Work Experience", "Education", "Projects", "Skills").`
    );
  }

  // Summary feedback (content‑aware)
  if (!parsedData.summary) {
    suggestions.push(
      'Add a 2–4 line Professional Summary at the top that clearly states your title, years of experience, main tech stack, and 2–3 quantified achievements relevant to the target role.'
    );
  } else if (parsedData.summary.length < 50) {
    suggestions.push(
      'Your Professional Summary is very short. Expand it to include your core tech stack, domains you have worked in, and at least one measurable impact (for example: “reduced API latency by 35%” or “improved test coverage to 85%”).'
    );
  }

  // Experience feedback
  if (!parsedData.experience || parsedData.experience.length === 0) {
    suggestions.push(
      'Add a Work Experience section with 3–6 bullet points per role. Focus each bullet on impact (metrics, scale, performance improvements) instead of responsibilities.'
    );
  } else {
    suggestions.push(
      `Review each role in your Work Experience section and rewrite bullets to be action‑oriented and measurable (for example: “Implemented ${jobRole}‑relevant features using ${displayedMatching.slice(0, 3).join(', ') || 'your primary tech stack'} that improved reliability, performance, or user experience”).`
    );
  }

  // Projects feedback
  if (!parsedData.projects || parsedData.projects.length === 0) {
    suggestions.push(
      'Add 1–3 Projects that demonstrate hands‑on use of the main tools from the job description. For each project, include technologies used, your specific contributions, and measurable outcomes.'
    );
  }

  // Skills section quality
  if (!parsedData.skills || !Array.isArray(parsedData.skills) || parsedData.skills.length === 0) {
    suggestions.push(
      'Create a dedicated Skills section grouping technologies into categories (e.g., Languages, Frameworks, Databases, Cloud/DevOps) and ensure the most important job‑specific skills appear in the first two lines.'
    );
  }

  // Formatting and length suggestions
  if (resumeWordCount < 150) {
    suggestions.push(
      'Your resume is very short. Add more detail to your Experience, Education, and Projects so that recruiters can see concrete evidence of your skills and impact.'
    );
  } else if (resumeWordCount > 800) {
    suggestions.push(
      'Your resume is quite long. Consider tightening older or less relevant roles and removing low‑impact bullet points so the most important information for this job stands out on the first page.'
    );
  }

  if (densityRatio > 0.03) {
    suggestions.push(
      'The same keywords appear very frequently. Rewrite repetitive lines so that skills are used naturally in context rather than being repeated in every bullet—this reduces the risk of looking keyword‑stuffed to recruiters.'
    );
  }

  // Grammar feedback (content‑aware)
  if (grammarIssues && grammarIssues.length > 0) {
    const sampleIssues = grammarIssues.slice(0, 3);
    suggestions.push(
      `We detected ${grammarIssues.length} grammar or basic writing issues. For example: ${sampleIssues
        .map(issue => `"${issue.text}" → ${issue.suggestion}`)
        .join('; ')}. Carefully proofread your resume or run it through a grammar checker.`
    );
  }

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
