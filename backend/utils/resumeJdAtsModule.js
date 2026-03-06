const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let embeddingPipelinePromise = null;
const jdEmbeddingCache = new Map(); // key -> { embedding: number[], at: number }
const JD_CACHE_MAX = 100;
const JD_CACHE_TTL_MS = 30 * 60 * 1000;

const SKILLS_DICT_PATH = path.join(__dirname, '..', 'data', 'skills.dictionary.json');
const SKILLS_DICT = JSON.parse(fs.readFileSync(SKILLS_DICT_PATH, 'utf8'));

const CANONICAL_SKILLS = Array.from(
  new Set([...(SKILLS_DICT.technical || []), ...(SKILLS_DICT.soft || [])])
);

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function clamp01(n) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function normalizeSpaces(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function cleanPdfArtifacts(s) {
  const input = s || '';
  // Join hyphenated line breaks: "de-\nveloper" -> "developer"
  const dehyphenated = input.replace(/([a-zA-Z])-\s*\r?\n\s*([a-zA-Z])/g, '$1$2');
  // Normalize line breaks and bullets to spaces
  const noWeird = dehyphenated
    .replace(/\u2022/g, ' ') // bullet
    .replace(/\u00a0/g, ' ') // nbsp
    .replace(/\r\n/g, '\n');
  return noWeird;
}

function removeSpecialChars(s) {
  // Keep letters, numbers, whitespace, and a few symbols used in skills (c++, c#, node.js, ci/cd)
  return (s || '').replace(/[^a-zA-Z0-9\s+#./-]/g, ' ');
}

function normalizeSynonymsInText(text) {
  const synonyms = SKILLS_DICT.synonyms || {};
  let t = ` ${text} `;
  // Word-boundary replacement for short forms (js/ts/ml/etc)
  for (const [from, to] of Object.entries(synonyms)) {
    const re = new RegExp(`\\b${escapeRegex(from)}\\b`, 'g');
    t = t.replace(re, to);
  }
  return t.trim();
}

function preprocessText(raw) {
  const cleaned = cleanPdfArtifacts(raw || '');
  const lowered = cleaned.toLowerCase();
  const synonymed = normalizeSynonymsInText(lowered);
  const specialRemoved = removeSpecialChars(synonymed);
  return normalizeSpaces(specialRemoved);
}

// Precompile skill regexes once (deterministic, no NER)
const SKILL_REGEXES = CANONICAL_SKILLS.map((skill) => {
  const normalizedSkill = preprocessText(skill);
  // allow flexible whitespace for multiword skills
  const pattern = normalizedSkill.split(' ').map(escapeRegex).join('\\s+');
  return {
    skill: skill,
    re: new RegExp(`(^|\\b)${pattern}(\\b|$)`, 'g')
  };
});

function extractSkillsDeterministic(preprocessedText) {
  const found = new Set();
  const t = ` ${preprocessedText} `;
  for (const { skill, re } of SKILL_REGEXES) {
    if (re.test(t)) {
      found.add(skill);
    }
    re.lastIndex = 0; // defensive for /g
  }
  return found;
}

async function getEmbeddingPipeline() {
  if (!embeddingPipelinePromise) {
    embeddingPipelinePromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2')
    );
  }
  return embeddingPipelinePromise;
}

// Start loading at module import (non-blocking)
getEmbeddingPipeline().catch(() => {});

async function embedText(text) {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(text, { pooling: 'mean', normalize: true });
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

function cacheGet(key) {
  const hit = jdEmbeddingCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > JD_CACHE_TTL_MS) {
    jdEmbeddingCache.delete(key);
    return null;
  }
  return hit.embedding;
}

function cacheSet(key, embedding) {
  jdEmbeddingCache.set(key, { embedding, at: Date.now() });
  if (jdEmbeddingCache.size > JD_CACHE_MAX) {
    // evict oldest
    let oldestKey = null;
    let oldestAt = Infinity;
    for (const [k, v] of jdEmbeddingCache.entries()) {
      if (v.at < oldestAt) {
        oldestAt = v.at;
        oldestKey = k;
      }
    }
    if (oldestKey) jdEmbeddingCache.delete(oldestKey);
  }
}

function sha256(s) {
  return crypto.createHash('sha256').update(s).digest('hex');
}

function extractYears(text) {
  const matches = [];
  const re = /(\d+)\+?\s*(years|yrs)\b/gi;
  let m;
  while ((m = re.exec(text || '')) !== null) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n)) matches.push(n);
  }
  return matches;
}

function detectSections(rawText) {
  const t = (rawText || '').toLowerCase();
  const has = (re) => re.test(t);
  // Basic heading detection; tolerate punctuation/spacing
  const skills = has(/(^|\n)\s*(skills|technical skills|core skills|skill set)\s*[:\n]/m);
  const experience = has(/(^|\n)\s*(experience|work experience|employment|professional experience|work history)\s*[:\n]/m);
  const projects = has(/(^|\n)\s*(projects|personal projects|academic projects)\s*[:\n]/m);
  const education = has(/(^|\n)\s*(education|academic background)\s*[:\n]/m);
  const presentCount = [skills, experience, projects, education].filter(Boolean).length;
  const sectionScore = presentCount * 25;
  return {
    skills,
    experience,
    projects,
    education,
    section_score: sectionScore
  };
}

async function analyzeResumeAgainstJD({ resumeRawText, jobDescriptionRawText }) {
  if (!resumeRawText || !normalizeSpaces(resumeRawText)) {
    const err = new Error('Empty resume');
    err.statusCode = 400;
    throw err;
  }
  if (!jobDescriptionRawText || !normalizeSpaces(jobDescriptionRawText)) {
    const err = new Error('Empty job description');
    err.statusCode = 400;
    throw err;
  }

  const resumeText = preprocessText(resumeRawText);
  const jdText = preprocessText(jobDescriptionRawText);

  // 1) Semantic similarity (embeddings + cosine)
  const jdKey = sha256(jdText);
  const cachedJdEmbedding = cacheGet(jdKey);

  const [resumeEmbedding, jdEmbedding] = await Promise.all([
    embedText(resumeText),
    cachedJdEmbedding ? Promise.resolve(cachedJdEmbedding) : embedText(jdText)
  ]);
  if (!cachedJdEmbedding) cacheSet(jdKey, jdEmbedding);

  const semanticSimilarity = clamp01(cosineFromEmbeddings(resumeEmbedding, jdEmbedding));
  const semantic_score = Math.round(semanticSimilarity * 100);

  // 2) Skill matching (deterministic, dictionary-based)
  const resumeSkills = extractSkillsDeterministic(resumeText);
  const jdSkills = extractSkillsDeterministic(jdText);

  const matched_skills = Array.from(jdSkills).filter((s) => resumeSkills.has(s)).sort();
  const missing_skills = Array.from(jdSkills).filter((s) => !resumeSkills.has(s)).sort();

  const totalJdSkills = jdSkills.size || 0;
  const skill_match_percentage = totalJdSkills
    ? Math.round((matched_skills.length / totalJdSkills) * 100)
    : 0;

  // 3) Experience matching (regex)
  const requiredYearsList = extractYears(jobDescriptionRawText);
  const candidateYearsList = extractYears(resumeRawText);

  const required_years = requiredYearsList.length ? Math.max(...requiredYearsList) : 0;
  const candidate_years = candidateYearsList.length ? Math.max(...candidateYearsList) : 0;

  const experience_score = required_years
    ? Math.round(Math.min(candidate_years / required_years, 1) * 100)
    : 100;

  // 4) Section detection
  const sectionInfo = detectSections(resumeRawText);
  const section_score = sectionInfo.section_score;

  // 5) Final ATS score (weighted, deterministic)
  const ats_score = Math.round(
    0.40 * semantic_score +
      0.30 * skill_match_percentage +
      0.20 * experience_score +
      0.10 * section_score
  );

  return {
    ats_score,
    semantic_score,
    skill_match_percentage,
    experience_score,
    section_score,
    matched_skills,
    missing_skills,
    candidate_years,
    required_years,
    experience_gap: required_years ? Math.max(required_years - candidate_years, 0) : 0
  };
}

module.exports = {
  analyzeResumeAgainstJD
};

