import { MOCK_STATS, MOCK_WORKERS, MOCK_REQUESTS } from './mockData';

// SET TRUE FOR GITHUB PAGES / DEMO MODE
const USE_MOCK = true; 

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const request = async (method, path, body = null) => {
  if (USE_MOCK) return null; // Fallback for generic requests in mock mode
  
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
};

export const api = {
  getStats: () => USE_MOCK ? Promise.resolve(MOCK_STATS) : request('GET', '/stats'),
  
  getRequests: () => USE_MOCK ? Promise.resolve(MOCK_REQUESTS) : request('GET', '/requests'),
  
  getWorkers: () => USE_MOCK ? Promise.resolve(MOCK_WORKERS) : request('GET', '/workers'),

 
  addWorker: (body) => USE_MOCK ? Promise.resolve(body) : request('POST', '/workers', body),
  updateRequestStatus: (id, status) => USE_MOCK ? Promise.resolve() : request('PATCH', `/requests/${id}/status`, { status }),
  verifyWorker: (id, val) => USE_MOCK ? Promise.resolve() : request('PATCH', `/workers/${id}/verify`, { is_verified: val }),
};