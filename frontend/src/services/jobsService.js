import axios from 'axios';
import { API_URL } from '../config/api';

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

