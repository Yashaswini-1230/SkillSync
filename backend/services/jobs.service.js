/**
 * Build a job-search URL (LinkedIn) so "Apply" still redirects when using fallback jobs.
 */
function buildJobSearchApplyLink(role, location) {
  const q = encodeURIComponent(role || 'jobs');
  const loc = encodeURIComponent(location || '');
  const params = new URLSearchParams({ keywords: role || '' });
  if (loc) params.set('location', location);
  return `https://www.linkedin.com/jobs/search/?${params.toString()}`;
}

/**
 * Build deterministic fallback jobs when JSearch is not configured or fails.
 * Each fallback job gets an applyLink to LinkedIn job search so Apply button still redirects.
 */
function buildFallbackJobs({ role, location, employmentType }) {
  const baseRole = role || 'Software Engineer';
  const loc = location || 'Remote';
  const now = new Date().toISOString();
  const applyLink = buildJobSearchApplyLink(baseRole, loc);

  const typeLabel = employmentType && employmentType !== 'ALL' ? employmentType : 'FULLTIME';

  const templates = [
    {
      id: 'sample-1',
      jobTitle: `${baseRole} (${typeLabel})`,
      company: 'SampleTech Labs',
      description:
        `Sample role for practicing job search in SkillSync. Work on real-world style projects, code reviews, and collaboration. This listing is offline demo data; use Apply to search real openings.`,
      employmentType: typeLabel,
      applyLink
    },
    {
      id: 'sample-2',
      jobTitle: `${baseRole} - Product Engineering`,
      company: 'DemoStack Systems',
      description:
        `Demo listing that mimics a typical ${baseRole} description: shipping features, debugging production issues, and working with product/design. Use Apply to find real roles.`,
      employmentType: typeLabel,
      applyLink
    },
    {
      id: 'sample-3',
      jobTitle: `${baseRole} (Early Career)`,
      company: 'PracticeWorks',
      description:
        `Practice-only role to help you test SkillSync without a live API key. Use Apply to search real job boards for ${baseRole} roles.`,
      employmentType: typeLabel,
      applyLink
    }
  ];

  return templates.map((job, index) => ({
    ...job,
    id: `${job.id}-${index}`,
    location: loc,
    postedAt: now
  }));
}

/**
 * Call JSearch RapidAPI to fetch jobs based on search filters.
 * Uses RAPIDAPI_KEY from environment variables. Falls back to sample jobs if not configured.
 */
async function searchJobsFromAPI({ role, location, employmentType }) {
  let axios;
  try {
    // Lazy-load axios so that missing dependency does not crash the whole server at startup
    // If axios is not installed, this endpoint will return a clear error instead.
    axios = require('axios');
  } catch (e) {
    const error = new Error('Axios is not installed on the backend. Please run "npm install axios" in the backend folder to enable Jobs search.');
    error.statusCode = 500;
    throw error;
  }

  const apiKey =
    process.env.RAPIDAPI_KEY ||
    process.env.RAPID_API_KEY ||
    process.env.JSEARCH_RAPIDAPI_KEY ||
    process.env.RAPIDAPIKEY;

  if (!apiKey) {
    // No API key configured: return deterministic sample jobs so the UI still works.
    return buildFallbackJobs({ role, location, employmentType });
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
      timeout: 10000
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

    // If API returns no jobs, still provide a small sample list so UI has content.
    return jobs.length > 0 ? jobs : buildFallbackJobs({ role, location, employmentType });
  } catch (err) {
    // On any API error, fall back to deterministic demo jobs so the feature keeps working.
    return buildFallbackJobs({ role, location, employmentType });
  }
}

module.exports = {
  searchJobsFromAPI
};

