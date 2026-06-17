const express = require("express");
const { body } = require("express-validator");
const Analysis = require("../models/Analysis");
const Resume = require("../models/Resume");
const auth = require("../middleware/auth");
const PDFDocument = require("pdfkit");
const axios = require("axios");

const { analyzeResume } = require("../utils/analysisEngine");

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

/* =====================================================
   POST /api/analysis
   Analyze resume and save result
===================================================== */

router.post(
  "/",
  auth,
  [
    body("resumeId").notEmpty(),
    body("jobRole").notEmpty(),
    body("jobDescription").notEmpty(),
  ],
  async (req, res) => {
    try {
      const { resumeId, jobRole, jobDescription } = req.body;

      const resume = await Resume.findOne({
        _id: resumeId,
        userId: req.user._id,
      });

      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      /* ===============================
         1️⃣ ML SERVICE ANALYSIS
      =============================== */

      let ai = {};

try {

  const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/analyzer/score`, {
  resume_text: resume.extractedText,
  job_description: jobDescription,
});

ai = aiResponse.data;

console.log("AI RESPONSE:");
console.log(JSON.stringify(ai, null, 2));

} catch (err) {

  console.log("AI service not available. Using rule engine only.");
  console.log(err.message);

}

      /* ===============================
         2️⃣ RULE BASED ATS ANALYSIS
      =============================== */

     let ruleAnalysis = {};

try {

  ruleAnalysis = await analyzeResume(
    resume.extractedText,
    resume.parsedData || {},
    jobDescription,
    jobRole
  );

} catch (err) {

  console.log("Rule engine error:", err.message);

}
      /* ===============================
         3️⃣ MERGE RESULTS
      =============================== */
const finalATSScore = ai.semantic_similarity
  ? Math.round(
      (
        (ai.semantic_similarity || 0) * 0.3 +
        (ai.skill_score || 0) * 0.4 +
        Math.max(
          100 - ((ai.missing_skills?.length || 0) * 5),
          0
        ) * 0.3
      )
    )
  : (ruleAnalysis?.atsScore || 50);

     const analysisResult = {

  // atsScore:
  //   ai.ats_score ||
  //   ruleAnalysis?.atsScore ||
  //   ai.overall_ats_score ||
  //   50,
//   atsScore: Math.round(
//     (
//         (ai.ats_score || 0) * 0.7 +
//         (ai.overall_ats_score || 0) * 0.3
//     )
// ),
atsScore: finalATSScore,

  matchingSkills:
    ruleAnalysis?.matchingSkills?.length > 0
      ? ruleAnalysis.matchingSkills
      : ai.matching_skills || [],

  missingSkills:
    ruleAnalysis?.missingSkills?.length > 0
      ? ruleAnalysis.missingSkills
      : ai.missing_skills || [],

  semanticScore:
    ai.semantic_similarity || 0,

  skillMatchPercentage:
    ai.skill_score || 0,

  experienceScore:
    ai.experience_relevance_score || 0,

  sectionScore:
    ruleAnalysis?.sectionScore || 0,

  missingSections:
    ruleAnalysis?.missingSections || [],

  grammarIssues:
    ruleAnalysis?.grammarIssues || [],

  suggestions:
    ruleAnalysis?.suggestions || [],

  jobRoleFit:
    ruleAnalysis?.jobRoleFit || 0,

  strengths:
    ai.strengths || [],

  weaknesses:
    ai.weaknesses || [],

  recruiterTips:
    ai.recruiter_tips || [],

  contactInformation:
    ai.contact_information || {},

  hardSkills:
    ai.hard_skills || {},

  softSkills:
    ai.soft_skills || {},

  searchability:
    ai.searchability || {},

  resumeTone:
    ai.resume_tone || {},

  educationMatch:
    ai.education_match || {},

  experienceMatch:
    ai.experience_match || {},

  jobTitleMatch:
    ai.job_title_match || {},

  measurableResults:
    ai.measurable_results || {},

  webPresence:
    ai.web_presence || {},

  rewrittenBullets:
    ai.rewritten_bullets || [],

  formattingScore:
    ai.formatting_score || 0,

  keywordOptimizationScore:
    ai.keyword_optimization_score || 0,

  leadershipScore:
    ai.leadership_score || 0,

  impactScore:
    ai.impact_score || 0,
  feedback:
    ai.feedback ||
    ai.feedback_summary ||
    "Resume analysis completed successfully.",

};

      /* ===============================
         5️⃣ SAVE TO DATABASE
      =============================== */

      const analysis = new Analysis({
  userId: req.user._id,
  resumeId: resume._id,
  jobRole,
  jobDescription,
  ...analysisResult
});
      await analysis.save();

      res.json({
        message: "Analysis completed successfully",
        analysis,
      });

    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ message: "Error analyzing resume" });
    }
  }
);

/* =====================================================
   GET all analyses
===================================================== */

router.get("/", auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .populate("resumeId", "originalName")
      .sort({ analyzedAt: -1 });

    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching analyses" });
  }
});

/* =====================================================
   GET single analysis
===================================================== */

router.get("/:id", auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("resumeId", "originalName");

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    res.json(analysis);

  } catch (error) {
    res.status(500).json({ message: "Error fetching analysis" });
  }
});

/* =====================================================
   DOWNLOAD PDF REPORT
===================================================== */
/* =====================================================
   DOWNLOAD PDF REPORT
===================================================== */

router.get("/:id/download", auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("resumeId", "originalName");

    if (!analysis) {
      return res.status(404).json({
        message: "Analysis not found"
      });
    }

    const doc = new PDFDocument({
      margin: 50,
      size: "A4"
    });

    const filename = `SkillSync_Report_${analysis._id}.pdf`;

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    doc.pipe(res);

    /* ==========================
       HEADER
    ========================== */

    doc
      .fontSize(24)
      .fillColor("#1E3A8A")
      .text(
        "SkillSync ATS Resume Analysis Report",
        {
          align: "center"
        }
      );

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .fillColor("black")
      .text(
        `Resume: ${analysis.resumeId?.originalName || "Resume"}`
      );

    doc.text(
      `Job Role: ${analysis.jobRole || "N/A"}`
    );

    doc.text(
      `Analysis Date: ${
        analysis.analyzedAt
          ? new Date(
              analysis.analyzedAt
            ).toLocaleDateString()
          : "N/A"
      }`
    );

    doc.moveDown();

    /* ==========================
       ATS SCORE
    ========================== */

    /* ==========================
   ATS SCORE
========================== */

doc
  .fontSize(20)
  .fillColor("#16A34A")
  .text(
    `Overall ATS Score: ${analysis.atsScore || 0}%`
  );

doc.moveDown();

/* ==========================
   DETAILED SCORES
========================== */

doc
  .fontSize(18)
  .fillColor("#1E3A8A")
  .text("Detailed Analysis Scores");

doc.moveDown(0.5);

doc
  .fontSize(11)
  .fillColor("black")
  .text(`Semantic Match: ${analysis.semanticScore ?? 0}%`);

doc.text(
  `Skill Match: ${analysis.skillMatchPercentage ?? 0}%`
);

doc.text(
  `Formatting Score: ${analysis.formattingScore ?? "N/A"}`
);

doc.text(
  `Leadership Score: ${analysis.leadershipScore ?? "N/A"}`
);

doc.text(
  `Impact Score: ${analysis.impactScore ?? "N/A"}`
);

doc.text(
  `Experience Relevance: ${
    analysis.experienceMatch?.score ??
    analysis.experienceScore ??
    0
  }%`
);

doc.text(
  `Searchability Score: ${
    analysis.searchability?.score ?? "N/A"
  }`
);

doc.text(
  `Resume Tone Score: ${
    analysis.resumeTone?.score ?? "N/A"
  }`
);

doc.text(
  `Education Match Score: ${
    analysis.educationMatch?.score ?? "N/A"
  }`
);

doc.text(
  `Job Title Match Score: ${
    analysis.jobTitleMatch?.score ?? "N/A"
  }`
);

doc.text(
  `Measurable Results Score: ${
    analysis.measurableResults?.score ?? "N/A"
  }`
);

doc.moveDown();

/* ==========================
   MATCHING SKILLS
========================== */
    /* ==========================
       MATCHING SKILLS
    ========================== */

    doc
      .fontSize(18)
      .fillColor("#1E3A8A")
      .text("Matching Skills");

    doc.moveDown(0.5);

    if (analysis.matchingSkills?.length) {

      analysis.matchingSkills.forEach(skill => {
        doc
          .fontSize(11)
          .fillColor("black")
          .text(`• ${skill}`);
      });

    } else {

      doc.text("No matching skills found.");

    }

    doc.moveDown();

    /* ==========================
       MISSING SKILLS
    ========================== */

    doc
      .fontSize(18)
      .fillColor("#DC2626")
      .text("Missing Skills");

    doc.moveDown(0.5);

    if (analysis.missingSkills?.length) {

      analysis.missingSkills.forEach(skill => {
        doc
          .fontSize(11)
          .fillColor("black")
          .text(`• ${skill}`);
      });

    } else {

      doc.text("No missing skills found.");

    }

    doc.moveDown();

    /* ==========================
       STRENGTHS
    ========================== */

    doc
      .fontSize(18)
      .fillColor("#15803D")
      .text("Strengths");

    doc.moveDown(0.5);

    if (analysis.strengths?.length) {

      analysis.strengths.forEach(item => {
        doc
          .fontSize(11)
          .fillColor("black")
          .text(`• ${item}`);
      });

    } else {

      doc.text("No strengths identified.");

    }

    doc.moveDown();

    /* ==========================
       WEAKNESSES
    ========================== */

    doc
      .fontSize(18)
      .fillColor("#DC2626")
      .text("Areas for Improvement");

    doc.moveDown(0.5);

    if (analysis.weaknesses?.length) {

      analysis.weaknesses.forEach(item => {
        doc
          .fontSize(11)
          .fillColor("black")
          .text(`• ${item}`);
      });

    } else {

      doc.text("No weaknesses identified.");

    }

    doc.moveDown();

    /* ==========================
       RECRUITER TIPS
    ========================== */

    doc
      .fontSize(18)
      .fillColor("#1E3A8A")
      .text("Recruiter Recommendations");

    doc.moveDown(0.5);

    const tips = [
      ...(analysis.suggestions || []),
      ...(analysis.recruiterTips || [])
    ];

    if (tips.length > 0) {

      tips.forEach(tip => {

        doc
          .fontSize(11)
          .fillColor("black")
          .text(`• ${tip}`);

      });

    } else {

      doc.text("No recommendations available.");

    }

    doc.moveDown();

    /* ==========================
       REWRITTEN BULLETS
    ========================== */

    doc
      .fontSize(18)
      .fillColor("#1E3A8A")
      .text("Improved Resume Bullet Points");

    doc.moveDown(0.5);

    if (analysis.rewrittenBullets?.length) {

      analysis.rewrittenBullets.forEach(
        (bullet, index) => {

          doc
            .fontSize(12)
            .fillColor("#DC2626")
            .text(`Original ${index + 1}:`);

          doc
            .fontSize(11)
            .fillColor("black")
            .text(bullet.original);

          doc.moveDown(0.2);

          doc
            .fontSize(12)
            .fillColor("#16A34A")
            .text("Improved:");

          doc
            .fontSize(11)
            .fillColor("black")
            .text(bullet.improved);

          doc.moveDown(0.2);

          doc
            .fontSize(11)
            .fillColor("#6B7280")
            .text(
              `Reason: ${bullet.reason}`
            );

          doc.moveDown();
        }
      );

    } else {

      doc.text(
        "No rewritten bullet points available."
      );

    }

    /* ==========================
       SUMMARY
    ========================== */

    doc.addPage();

    doc
      .fontSize(18)
      .fillColor("#1E3A8A")
      .text("Final Recruiter Summary");

    doc.moveDown();

    doc
      .fontSize(12)
      .fillColor("black")
      .text(
        analysis.feedback ||
        "Resume analysis completed successfully."
      );

    doc.end();

  } catch (error) {

    console.error(
      "PDF Generation Error:",
      error
    );

    res.status(500).json({
      message:
        "Error generating PDF report"
    });

  }
});



module.exports = router;
