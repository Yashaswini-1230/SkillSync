const express = require('express');
const router = express.Router();
const { searchJobs } = require('../controllers/jobs.controller');

// @route   GET /api/jobs/search
// @desc    Search jobs & internships via JSearch API
// @access  Public (no auth required)
router.get('/search', searchJobs);

module.exports = router;

