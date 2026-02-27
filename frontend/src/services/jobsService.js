import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function searchJobs({ role, location, employmentType }) {
  const params = {
    role: role || '',
    location: location || '',
  };

  if (employmentType && employmentType !== 'ALL') {
    params.employmentType = employmentType;
  }

  const response = await axios.get(`${API_URL}/jobs/search`, { params });
  return response.data;
}

