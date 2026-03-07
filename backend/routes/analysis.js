const express = require("express");
const { body, validationResult } = require("express-validator");
const Analysis = require("../models/Analysis");
const Resume = require("../models/Resume");
const auth = require("../middleware/auth");
const PDFDocument = require("pdfkit");
const multer = require("multer");
const path = require("path");
const fsp = require("fs").promises;
const axios = require("axios");

const { analyzeResume } = require("../utils/analysisEngine");
const { extractResumeText } = require("../utils/pdfParser");
const { generateAtsFeedback } = require("../services/atsFeedback.service");

const router = express.Router();

const ML_SERVICE_URL = "http://127.0.0.1:8000";

/* ===============================
   Multer configuration
================================ */

const atsStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/ats");

    try {
      await fsp.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },

  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "");
    cb(null, `ats-${unique}${ext}`);
  },
});

const atsUpload = multer({
  storage: atsStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

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

      let ml = {};

try {

  const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, {
    resume_text: resume.extractedText,
    job_description: jobDescription,
  });

  ml = mlResponse.data;

} catch (err) {

  console.log("ML service not available. Using rule engine only.");
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

     const analysisResult = {

  // Prefer rule engine if ML score is poor
  atsScore:
    ruleAnalysis?.atsScore && !isNaN(ruleAnalysis.atsScore)
      ? ruleAnalysis.atsScore
      : ml.ats_score ?? 50,

  matchingSkills:
    ruleAnalysis?.matchingSkills?.length > 0
      ? ruleAnalysis.matchingSkills
      : ml.matched_skills ?? [],

  missingSkills:
    ruleAnalysis?.missingSkills ?? ml.missing_skills ?? [],

  semanticScore: ml.semantic_similarity ?? 0,

  skillMatchPercentage: ml.skill_score ?? 0,

  experienceScore: ml.experience_score ?? 0,

  sectionScore: ruleAnalysis?.sectionScore ?? 0,

  missingSections: ruleAnalysis?.missingSections ?? [],

  grammarIssues: ruleAnalysis?.grammarIssues ?? [],

  suggestions: ruleAnalysis?.suggestions ?? [],

  jobRoleFit: ruleAnalysis?.jobRoleFit ?? 0

};
console.log("ML RESULT:", ml);
console.log("RULE RESULT:", ruleAnalysis);
console.log("FINAL RESULT:", analysisResult);

      /* ===============================
         4️⃣ GENERATE FEEDBACK
      =============================== */

      let feedback = [];

try {

  feedback = await generateAtsFeedback({
    semantic_score: analysisResult.semanticScore,
    skill_match_percentage: analysisResult.skillMatchPercentage,
    missing_skills: analysisResult.missingSkills,
    experience_gap: analysisResult.experienceScore,
    section_score: analysisResult.sectionScore,
  });

} catch (err) {

  console.log("Feedback generation error:", err.message);

}

      /* ===============================
         5️⃣ SAVE TO DATABASE
      =============================== */

      const analysis = new Analysis({
        userId: req.user._id,
        resumeId: resume._id,
        jobRole,
        jobDescription,
        ...analysisResult,
        feedback
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

router.get("/:id/download", auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("resumeId", "originalName");

    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    const filename = `resume-analysis-${analysis._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(24).text("SkillSync Resume Analysis Report", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Resume: ${analysis.resumeId?.originalName || "Resume"}`);
    doc.text(`Job Role: ${analysis.jobRole}`);
    doc.text(`ATS Score: ${analysis.atsScore}%`);
    doc.moveDown();

    doc.fontSize(18).text("Matching Skills");
    analysis.matchingSkills.forEach(skill => doc.text(`• ${skill}`));

    doc.moveDown();

    doc.fontSize(18).text("Missing Skills");
    analysis.missingSkills.forEach(skill => doc.text(`• ${skill}`));

    doc.moveDown();

    doc.fontSize(18).text("Missing Resume Sections");
    analysis.missingSections.forEach(section => doc.text(`• ${section}`));

    doc.moveDown();

    doc.fontSize(18).text("Resume Suggestions");
    analysis.suggestions.forEach(s => doc.text(`• ${s}`));

    doc.end();

  } catch (error) {
    console.error("PDF error:", error);
    res.status(500).json({ message: "Error generating PDF" });
  }
});

module.exports = router;