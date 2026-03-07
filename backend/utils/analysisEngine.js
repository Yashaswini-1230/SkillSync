/* =====================================
   SIMPLE REALISTIC ATS ENGINE
   (Stable Version)
===================================== */

const SKILLS = [
  "javascript","react","node","express","mongodb","sql",
  "html","css","python","java","git","docker","aws",
  "rest api","redux","graphql","typescript"
];

const SOFT_SKILLS = [
  "communication","teamwork","leadership",
  "problem solving","adaptability"
];


/* =====================================
   SKILL EXTRACTION
===================================== */

function extractSkills(text){

  if(!text) return [];

  const lower = text.toLowerCase();

  return SKILLS.filter(skill => lower.includes(skill));

}


/* =====================================
   SECTION DETECTION
===================================== */

function detectSections(text){

  const lower = text.toLowerCase();

  const sections = [
    "summary",
    "skills",
    "experience",
    "education",
    "projects"
  ];

  return sections.filter(section => !lower.includes(section));

}


/* =====================================
   CONTACT INFO
===================================== */

function detectContact(text){

  return {
    email: /\S+@\S+\.\S+/.test(text),
    phone: /\d{10}/.test(text),
    linkedin: text.toLowerCase().includes("linkedin")
  };

}


/* =====================================
   METRICS CHECK
===================================== */

function detectMetrics(text){

  return /\d+%|\d+x|\d+\+/.test(text);

}


/* =====================================
   ATS SCORE CALCULATION
===================================== */

function calculateScore(data){

  let score = 0;

  /* --------------------------
     SKILL MATCH (40%)
  ---------------------------*/

  if(data.totalSkills > 0){

    const skillRatio = data.matchedSkills / data.totalSkills;

    score += skillRatio * 40;

  } else {

    score += 30; // fallback if JD skills not detected

  }

  /* --------------------------
     SECTION STRUCTURE (20%)
  ---------------------------*/

  score += (data.sectionScore / 100) * 20;

  /* --------------------------
     CONTACT INFO (15%)
  ---------------------------*/

  let contactPoints = 0;

  if(data.contact.email) contactPoints += 5;
  if(data.contact.phone) contactPoints += 5;
  if(data.contact.linkedin) contactPoints += 5;

  score += contactPoints;

  /* --------------------------
     METRICS / ACHIEVEMENTS (10%)
  ---------------------------*/

  if(data.metrics) score += 10;

  /* --------------------------
     JOB TITLE MATCH (5%)
  ---------------------------*/

  if(data.jobTitleMatch) score += 5;

  /* --------------------------
     NORMALIZATION
  ---------------------------*/

  if(score > 95) score = 95;
  if(score < 25) score = 25;

  return Math.round(score);

}


/* =====================================
   MAIN ANALYSIS FUNCTION
===================================== */

async function analyzeResume(resumeText, parsedData, jobDescription, jobRole){

  if(!resumeText) resumeText = "";
  if(!jobDescription) jobDescription = "";

  /* ----------------------------------
     SKILL EXTRACTION
  -----------------------------------*/

  const resumeSkills = extractSkills(resumeText);

  const jobSkills = extractSkills(jobDescription);

  /* ----------------------------------
     SKILL MATCHING
  -----------------------------------*/

  const matchingSkills = jobSkills.filter(skill =>
    resumeSkills.includes(skill)
  );

  const missingSkills = jobSkills.filter(skill =>
    !resumeSkills.includes(skill)
  );

  /* ----------------------------------
     SECTION CHECK
  -----------------------------------*/

  const missingSections = detectSections(resumeText);

  const sectionScore = Math.max(0, 100 - missingSections.length * 10);

  /* ----------------------------------
     CONTACT INFO
  -----------------------------------*/

  const contact = detectContact(resumeText);

  /* ----------------------------------
     METRICS
  -----------------------------------*/

  const metrics = detectMetrics(resumeText);

  /* ----------------------------------
     JOB ROLE MATCH
  -----------------------------------*/

  const jobTitleMatch = resumeText
    .toLowerCase()
    .includes(jobRole.toLowerCase());

  /* ----------------------------------
     SCORE
  -----------------------------------*/

  const atsScore = calculateScore({

    matchedSkills: matchingSkills.length,

    totalSkills: jobSkills.length || matchingSkills.length || 1,

    sectionScore,

    contact,

    metrics,

    jobTitleMatch

  });

  /* ----------------------------------
     SUGGESTIONS
  -----------------------------------*/

  const suggestions = [];

  if(missingSections.length > 0){

    suggestions.push(
      "Add missing sections: " + missingSections.join(", ")
    );

  }

  if(missingSkills.length > 0){

    suggestions.push(
      "Consider adding these skills: " +
      missingSkills.slice(0,5).join(", ")
    );

  }

  if(!metrics){

    suggestions.push(
      "Add measurable achievements (example: improved performance by 30%)"
    );

  }

  if(!contact.linkedin){

    suggestions.push(
      "Add LinkedIn profile to improve recruiter credibility"
    );

  }

  return {

    atsScore,

    matchingSkills,

    missingSkills,

    missingSections,

    grammarIssues: [],

    sectionScore,

    jobRoleFit: jobTitleMatch ? 80 : 40,

    suggestions

  };

}

module.exports = { analyzeResume };