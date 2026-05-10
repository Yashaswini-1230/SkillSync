const axios = require('axios');

(async () => {
  try {
    const API_URL = 'http://localhost:5000/api';
    const loginResp = await axios.post(`${API_URL}/auth/login`, { email: 'test@example.com', password: 'Password1' });
    console.log('login success', loginResp.data);
  } catch (err) {
    console.error('login error', err.response?.status, err.response?.data, err.message);
  }
})();
