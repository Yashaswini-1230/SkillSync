const natural = require('natural');
const nlp = require('compromise');

let embeddingPipelinePromise = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    // Dynamically import ESM-only transformers inside CommonJS
    embeddingPipelinePromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2')
    );
  }
  return embeddingPipelinePromise;
}

async function embedText(text) {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
  // output.data is a TypedArray
  return Array.from(output.data);
}

function cosineFromEmbeddings(a, b) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

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

  // Curated technical skills database (single or short phrases only)
  const technicalSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'php', 'ruby',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
    'mongodb', 'mysql', 'postgresql', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins',
    'git', 'github', 'gitlab', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui',
    'machine learning', 'deep learning', 'artificial intelligence', 'ai', 'nlp', 'data science',
    'frontend', 'backend', 'full stack', 'devops', 'microservices',
    'rest api', 'graphql', 'websocket', 'tcp/ip', 'http/https'
  ];

  // Direct phrase / keyword matches
  technicalSkills.forEach((skill) => {
    if (lowerText.includes(skill)) {
      skills.push(skill);
    }
  });

  // Use NLP to extract noun phrases and map them back to core technical skills
  const doc = nlp(text);
  const nouns = doc.nouns().out('array');

  nouns.forEach((noun) => {
    const lowerNoun = noun.toLowerCase().trim();
    if (lowerNoun.length <= 3) return; // too short to be meaningful

    // Ignore long, sentence-like phrases and ones dominated by stopwords
    const wordTokens = lowerNoun.split(/\s+/).filter(Boolean);
    if (wordTokens.length > 4) return;

    const stopwords = new Set(['the', 'a', 'an', 'of', 'and', 'or', 'for', 'to', 'in', 'on']);
    const nonStopCount = wordTokens.filter((w) => !stopwords.has(w)).length;
    if (!nonStopCount) return;

    technicalSkills.forEach((skill) => {
      const ls = skill.toLowerCase();
      // If this noun chunk clearly mentions a known skill, add the clean skill name
      if (lowerNoun.includes(ls) || ls.includes(lowerNoun)) {
        skills.push(skill);
      }
    });
  });

  return [...new Set(skills)]; // Remove duplicates
}

/**
 * Detect missing sections in resume
 */
function detectMissingSections(resumeText, parsedData) {
  const missing = [];
  const text = resumeText || '';
  const lower = text.toLowerCase();

  // Summary / objective
  const hasSummary =
    (!!parsedData.summary && String(parsedData.summary).trim().length > 0) ||
    /\b(summary|professional summary|objective|about me)\b/m.test(lower);
  if (!hasSummary) {
    missing.push('Professional Summary');
  }

  // Work experience
  const hasExperienceHeading = /(^|\n)\s*(experience|work experience|employment|professional experience|work history)\s*[:\n]/m.test(
    lower
  );
  const hasExperienceData =
    Array.isArray(parsedData.experience) && parsedData.experience.length > 0;
  if (!hasExperienceHeading && !hasExperienceData) {
    missing.push('Work Experience');
  }

  // Education
  const hasEducationHeading = /(^|\n)\s*(education|academic background|qualifications)\s*[:\n]/m.test(
    lower
  );
  const hasEducationData =
    Array.isArray(parsedData.education) && parsedData.education.length > 0;
  if (!hasEducationHeading && !hasEducationData) {
    missing.push('Education');
  }

  // Skills
  const hasSkillsHeading = /(^|\n)\s*(skills|technical skills|core skills|skill set)\s*[:\n]/m.test(
    lower
  );
  const hasSkillsData =
    Array.isArray(parsedData.skills) && parsedData.skills.length > 0;
  if (!hasSkillsHeading && !hasSkillsData) {
    missing.push('Skills');
  }

  // Projects
  const hasProjectsHeading = /(^|\n)\s*(projects|personal projects|academic projects)\s*[:\n]/m.test(
    lower
  );
  const hasProjectsData =
    Array.isArray(parsedData.projects) && parsedData.projects.length > 0;
  if (!hasProjectsHeading && !hasProjectsData) {
    missing.push('Projects');
  }

  return missing;
}

/**
 * Check grammar and spelling (basic implementation)
 */
function checkGrammar(text) {
  const issues = [];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim());

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();

    // Skip lines that are likely URLs, contact lines, or highly formatted blocks
    if (
      lower.includes('http://') ||
      lower.includes('https://') ||
      lower.includes('www.') ||
      lower.includes('linkedin') ||
      lower.includes('github') ||
      lower.includes('@') ||
      trimmed.length > 220
    ) {
      return;
    }

    // Basic checks for sentence casing and very short fragments
    if (!trimmed[0].match(/[A-Z]/)) {
      issues.push({
        text: trimmed,
        suggestion: 'Sentence should start with a capital letter',
        severity: 'low'
      });
    }

    if (trimmed.length < 10 && /\s/.test(trimmed)) {
      issues.push({
        text: trimmed,
        suggestion: 'Sentence seems too short, consider expanding',
        severity: 'low'
      });
    }
  });

  return issues;
}

/**
 * Detect weak vs strong action verbs and quantify bullets
 */
function analyzeBullets(resumeText, jobRole) {
  const lines = resumeText.split('\n').map(l => l.trim()).filter(Boolean);
  const weakPhrases = [
    'responsible for',
    'worked on',
    'involved in',
    'participated in',
    'helped',
    'assisted',
    'duties include',
    'tasked with'
  ];
  const strongVerbs = [
    'led',
    'built',
    'implemented',
    'designed',
    'architected',
    'optimized',
    'improved',
    'increased',
    'reduced',
    'automated',
    'migrated',
    'refactored',
    'delivered',
    'shipped',
    'owned'
  ];

  const bulletLines = lines.filter(l =>
    l.startsWith('-') || l.startsWith('•') || l.startsWith('*')
  );

  const weak_bullets = [];
  const rewritten_examples = [];

  let bulletsWithMetrics = 0;
  let bulletsWithStrongVerbs = 0;

  bulletLines.forEach(raw => {
    const text = raw.replace(/^[-*•]\s*/, '');
    const lower = text.toLowerCase();
    const hasNumber = /\d+/.test(text) || /%/.test(text);
    const hasStrongVerb = strongVerbs.some(v => lower.startsWith(v + ' ') || lower.includes(` ${v} `));
    const hasWeak = weakPhrases.some(p => lower.startsWith(p) || lower.includes(` ${p} `));

    if (hasNumber) bulletsWithMetrics += 1;
    if (hasStrongVerb) bulletsWithStrongVerbs += 1;

    if (hasWeak && !hasStrongVerb) {
      const suggestion = `Rewrite to start with a strong verb and add a measurable outcome relevant to ${jobRole || 'the target role'}.`;
      const rewritten = `Implemented ${jobRole || 'key features'} using your core tech stack, resulting in a measurable impact (for example: reduced latency by 30% or improved conversion rate by 12%).`;
      weak_bullets.push({
        text,
        reason: 'Uses weak or responsibility-focused phrasing',
        suggestion
      });
      rewritten_examples.push(rewritten);
    } else if (!hasNumber) {
      const suggestion = `Add at least one number (%, count, or time) to show impact for this line in the context of ${jobRole || 'the role'}.`;
      weak_bullets.push({
        text,
        reason: 'No clear metrics or quantification',
        suggestion
      });
      rewritten_examples.push(
        `Led a ${jobRole || 'project'} initiative and achieved a specific, quantified outcome (for example: onboarded 5+ clients, increased uptime to 99.9%, or cut build times by 40%).`
      );
    }
  });

  const totalBullets = bulletLines.length || 1;
  const quantificationRatio = bulletsWithMetrics / totalBullets;
  const strongVerbRatio = bulletsWithStrongVerbs / totalBullets;

  return {
    weak_bullets,
    rewritten_examples: Array.from(new Set(rewritten_examples)).slice(0, 10),
    quantificationRatio,
    strongVerbRatio
  };
}

/**
 * Main analysis function (async, uses sentence-transformers all-MiniLM-L6-v2)
 */
async function analyzeResume(resumeText, parsedData, jobDescription, jobRole) {
  const safeResumeText = resumeText || '';
  const safeJobDescription = jobDescription || '';
  const safeParsed = parsedData || {};

  // Structured extraction
  const resumeSkills = extractSkills(safeResumeText);
  const jdSkills = extractSkills(safeJobDescription);
  const experience = Array.isArray(safeParsed.experience) ? safeParsed.experience : [];
  const education = Array.isArray(safeParsed.education) ? safeParsed.education : [];
  const projects = Array.isArray(safeParsed.projects) ? safeParsed.projects : [];

  // Sentence-transformers embeddings (all-MiniLM-L6-v2)
  const [resumeEmbedding, jdEmbedding] = await Promise.all([
    embedText(safeResumeText || safeJobDescription),
    embedText(safeJobDescription || safeResumeText)
  ]);
  const semanticSimilarity = cosineFromEmbeddings(resumeEmbedding, jdEmbedding);

  // Skill gap analysis using cosine similarity with dynamic threshold
  const missing_skills = [];
  const matchingSkills = new Set();

  const jdSkillEmbeddings = await Promise.all(
    jdSkills.map((s) => embedText(s))
  );
  const resumeSkillEmbeddings = await Promise.all(
    resumeSkills.map((s) => embedText(s))
  );

  jdSkills.forEach((jdSkill, idx) => {
    const jdEmb = jdSkillEmbeddings[idx];
    let bestSim = 0;
    let bestResumeSkill = null;

    resumeSkills.forEach((rs, rIdx) => {
      const rsEmb = resumeSkillEmbeddings[rIdx];
      const sim = cosineFromEmbeddings(jdEmb, rsEmb);
      if (sim > bestSim) {
        bestSim = sim;
        bestResumeSkill = rs;
      }
    });

    // Dynamic threshold based on overall similarity (0.55–0.7)
    const baseThreshold = 0.55;
    const highThreshold = 0.7;
    const dynamicThreshold =
      baseThreshold + (highThreshold - baseThreshold) * (1 - semanticSimilarity);

    if (bestSim >= dynamicThreshold && bestResumeSkill) {
      matchingSkills.add(bestResumeSkill);
    } else {
      missing_skills.push({
        name: jdSkill,
        confidence: Number(bestSim.toFixed(2))
      });
    }
  });

  const matchingSkillsArr = Array.from(matchingSkills);

  // Experience relevance score (embedding similarity of each role)
  let experienceScoreRaw = 0;
  if (experience.length > 0) {
    const expSimilarities = await Promise.all(
      experience.map(async (exp) => {
        const snippet = `${exp.title || ''} ${exp.company || ''} ${exp.description || ''}`;
        const emb = await embedText(snippet || safeResumeText);
        return cosineFromEmbeddings(emb, jdEmbedding);
      })
    );
    const avgExpSim =
      expSimilarities.reduce((sum, v) => sum + v, 0) / expSimilarities.length;
    experienceScoreRaw = avgExpSim;
  }

  // Keyword density (how often JD skills appear in resume)
  const resumeWordCount = safeResumeText.split(/\s+/).filter(Boolean).length || 1;
  const keywordHits = jdSkills.reduce((count, skill) => {
    const pattern = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    const matches = safeResumeText.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);
  const densityRatio = keywordHits / resumeWordCount;

  // Action verbs and quantification
  const bulletAnalysis = analyzeBullets(safeResumeText, jobRole);

  // Weighted scoring components (all 0-100)
  // Skills semantic score: proportion of JD skills with a strong semantic match
  const skills_match_score = jdSkills.length
    ? Math.min(100, Math.round((matchingSkillsArr.length / jdSkills.length) * 100))
    : 0;
  const skills_semantic_score = skills_match_score;

  // Experience relevance: embedding-based similarity mapped to 0-100
  const experience_relevance_score = Math.min(
    100,
    Math.round(experienceScoreRaw * 100)
  );

  // Simple keyword score based on how often JD terms appear in resume
  const keyword_score = Math.max(
    0,
    Math.min(100, Math.round(densityRatio * 4000))
  );

  // Project relevance: reuse experience similarity as an approximation if projects exist
  const project_relevance_score =
    projects && projects.length
      ? experience_relevance_score
      : Math.round(experience_relevance_score * 0.7);

  // Impact & metrics score (numbers + strong verbs)
  const impact_metrics_score = Math.min(
    100,
    Math.round(
      (bulletAnalysis.quantificationRatio * 0.6 +
        bulletAnalysis.strongVerbRatio * 0.4) *
        100
    )
  );

  // Action verb strength score
  const action_verb_strength_score = Math.min(
    100,
    Math.round(bulletAnalysis.strongVerbRatio * 100)
  );

  // Final ATS score using requested weights
  const ats_score = Math.round(
    skills_semantic_score * 0.3 +
      keyword_score * 0.15 +
      experience_relevance_score * 0.2 +
      project_relevance_score * 0.1 +
      impact_metrics_score * 0.15 +
      action_verb_strength_score * 0.1
  );

  // Legacy-style helpers reused
  const missingSections = detectMissingSections(safeResumeText, safeParsed);
  const grammarIssues = checkGrammar(safeResumeText);

  // Personalized, job-role-aware suggestions
  const improvement_suggestions = [];
  const roleLabel = jobRole || 'the target role';

  improvement_suggestions.push(
    `For the ${roleLabel} position, your overall ATS alignment is approximately ${ats_score}%. Focus on strengthening the skills and experience that most directly match the posted responsibilities.`
  );

  if (matchingSkillsArr.length) {
    improvement_suggestions.push(
      `You already surface important ${roleLabel} skills such as ${matchingSkillsArr
        .slice(0, 5)
        .join(', ')}. Move the strongest ones into the first two bullet points under the most relevant experience or projects.`
    );
  }

  if (missing_skills.length) {
    improvement_suggestions.push(
      `The job description highlights skills like ${missing_skills
        .slice(0, 5)
        .map((s) => s.name)
        .join(', ')} which are not clearly demonstrated in your resume. If you truly have experience here, add 1–2 bullets under the most relevant role that show how you used each skill with a measurable outcome.`
    );
  }

  if (bulletAnalysis.quantificationRatio < 0.5) {
    improvement_suggestions.push(
      `Less than half of your bullet points include concrete numbers. For a ${roleLabel} resume, aim for at least one metric in most bullets (for example: “reduced deployment time by 40%”, “handled 25+ tickets per week”, or “cut infrastructure costs by 18%”).`
    );
  }

  if (bulletAnalysis.strongVerbRatio < 0.5) {
    improvement_suggestions.push(
      `Many bullets currently read like responsibilities rather than achievements. Start more lines with strong, outcome-focused verbs (such as “implemented”, “optimized”, or “designed”) that match what a ${roleLabel} is expected to do.`
    );
  }

  if (missingSections.length) {
    improvement_suggestions.push(
      `Add or strengthen these sections so an ATS and recruiter can quickly parse your profile: ${missingSections.join(
        ', '
      )}. Use standard headings like “Work Experience”, “Education”, “Projects”, and “Skills”.`
    );
  }

  // Include a few grammar-aware notes
  if (grammarIssues && grammarIssues.length) {
    const sample = grammarIssues.slice(0, 3);
    improvement_suggestions.push(
      `Polish your writing quality by fixing grammar and style issues such as: ${sample
        .map((i) => `"${i.text}" → ${i.suggestion}`)
        .join('; ')}. Clean, consistent writing improves perceived seniority for ${roleLabel}.`
    );
  }

  // Backwards-compatible fields for existing frontend and reports
  const atsScoreLegacy = Math.min(100, Math.max(0, ats_score));
  const jobRoleFit = Math.min(
    100,
    Math.max(
      0,
      Math.round((semanticSimilarity * 50) + (skills_match_score * 0.5))
    )
  );

  const legacySuggestions = [...improvement_suggestions];

  return {
    // New structured JSON for semantic analysis pipeline
    ats_score,
    breakdown: {
      skills: skills_semantic_score,
      keywords: keyword_score,
      experience: experience_relevance_score,
      projects: project_relevance_score,
      metrics: impact_metrics_score,
      action_verbs: action_verb_strength_score
    },
    skills_match_score: skills_semantic_score,
    experience_score: experience_relevance_score,
    keyword_density_score: keyword_score,
    impact_metrics_score,
    missing_skills,
    weak_bullets: bulletAnalysis.weak_bullets,
    improvement_suggestions,
    rewritten_examples: bulletAnalysis.rewritten_examples,

    // Legacy fields expected by existing frontend and PDF reports
    atsScore: atsScoreLegacy,
    matchingSkills: matchingSkillsArr,
    missingSkills: missing_skills.map((s) => s.name),
    missingSections,
    grammarIssues,
    suggestions: legacySuggestions,
    jobRoleFit
  };
}

module.exports = {
  analyzeResume,
  extractSkills,
  cosineSimilarity
};
