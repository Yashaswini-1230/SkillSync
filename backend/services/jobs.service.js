/**
 * Call JSearch RapidAPI to fetch jobs based on search filters.
 * Requires RAPIDAPI_KEY (or RAPID_API_KEY, JSEARCH_RAPIDAPI_KEY, RAPIDAPIKEY) in environment.
 */
// generate a simple fallback job list when the external API is unavailable
function generateSampleJobs({ role, location, employmentType }) {
  const queryParts = [];
  if (role) queryParts.push(role);
  if (location) queryParts.push(location);
  const query = queryParts.join(' ').trim();
  const applyLink = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(query)}`;

  return [
    {
      id: `sample-${Date.now()}`,
      jobTitle: role ? `Sample ${role}` : 'Sample Job',
      company: 'Example Corp',
      location: location || 'Anywhere',
      employmentType: employmentType || 'FULLTIME',
      description: 'This is a sample job listing generated as a fallback.',
      applyLink,
      postedAt: null
    }
  ];
}

async function searchJobsFromAPI({ role, location, employmentType }) {
  let axios;
  try {
    axios = require('axios');
  } catch (e) {
    const error = new Error('Axios is not installed on the backend. Please run "npm install axios" in the backend folder to enable Jobs search.');
    error.statusCode = 500;
    throw error;
  }

  const rawKey =
    process.env.RAPIDAPI_KEY ||
    process.env.RAPID_API_KEY ||
    process.env.JSEARCH_RAPIDAPI_KEY ||
    process.env.RAPIDAPIKEY ||
    '';
  const apiKey = typeof rawKey === 'string' ? rawKey.trim() : '';

  if (!apiKey) {
    // no API key configured; return a sample job immediately instead of throwing
    console.warn('JSearch API key missing - returning sample jobs fallback');
    return generateSampleJobs({ role, location, employmentType });
  }

  const queryParts = [];
  if (role) queryParts.push(role);
  if (location) queryParts.push(`in ${location}`);
  const query = queryParts.join(' ').trim();

  const params = {
    query,
    page: 1,
    num_pages: 1,
    date_posted: 'week'
  };

  if (employmentType && employmentType !== 'ALL') {
    // Map CONTRACT to CONTRACTOR to align with JSearch enum
    const mapped =
      employmentType === 'CONTRACT' ? 'CONTRACTOR' : employmentType;
    params.employment_types = mapped;
  }

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params,
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      // bump timeout to 20 seconds in case the remote API is slow
      timeout: 20000
    });

    const apiData = response.data && Array.isArray(response.data.data)
      ? response.data.data
      : [];

    const jobs = apiData.map((job) => {
      const locationParts = [
        job.job_city,
        job.job_state,
        job.job_country
      ].filter(Boolean);

      const fullDescription = job.job_description || '';
      const shortDescription =
        fullDescription.length > 200
          ? `${fullDescription.slice(0, 200).trim()}...`
          : fullDescription;

      const applyLink =
        job.job_apply_link ||
        (Array.isArray(job.job_apply_links) && job.job_apply_links[0]) ||
        null;

      const postedAt =
        job.job_posted_at_datetime_utc ||
        job.job_posted_at_timestamp ||
        job.job_posted_at ||
        null;

      return {
        id: job.job_id,
        jobTitle: job.job_title,
        company: job.employer_name,
        location: locationParts.join(', '),
        employmentType: job.job_employment_type,
        description: shortDescription,
        applyLink,
        postedAt
      };
    });

    // When API key is set, return real results only (empty array if no jobs found).
    return jobs;
  } catch (err) {
    // log the issue and return a fallback set of jobs instead of throwing
    console.error('Jobs API call failed:', err.message || err);
    return generateSampleJobs({ role, location, employmentType });
  }
}

module.exports = {
  searchJobsFromAPI
};

