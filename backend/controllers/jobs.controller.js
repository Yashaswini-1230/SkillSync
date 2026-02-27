const { searchJobsFromAPI } = require('../services/jobs.service');

function sendError(res, statusCode, message, details) {
  const payload = {
    success: false,
    message
  };
  if (details) {
    payload.details = details;
  }
  return res.status(statusCode).json(payload);
}

async function searchJobs(req, res) {
  try {
    const { role, location, employmentType } = req.query;

    if (!role || !role.trim()) {
      return sendError(res, 400, 'Job role (role) query parameter is required');
    }

    const normalizedEmploymentType = employmentType
      ? employmentType.toUpperCase()
      : 'ALL';

    const allowedTypes = ['FULLTIME', 'PARTTIME', 'INTERN', 'CONTRACT', 'ALL'];
    if (!allowedTypes.includes(normalizedEmploymentType)) {
      return sendError(
        res,
        400,
        'Invalid employmentType. Allowed values: FULLTIME, PARTTIME, INTERN, CONTRACT'
      );
    }

    const jobs = await searchJobsFromAPI({
      role: role.trim(),
      location: location ? location.trim() : '',
      employmentType: normalizedEmploymentType
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Unexpected error while searching jobs';
    return sendError(res, statusCode, message, error.details);
  }
}

module.exports = {
  searchJobs
};

