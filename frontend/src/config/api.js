export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const SERVER_URL =
  API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || SERVER_URL;
