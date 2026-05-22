// src/services/apiService.js
// ---------------------------------------------------------------------------
// Skill-Link CDO Web App — Centralized API Service
// ---------------------------------------------------------------------------
// All HTTP calls to the Django backend go through this file.
// The frontend never calls the FastAPI ML service directly.
// The ML results come back as part of the job request creation response.
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ---------------------------------------------------------------------------
// HTTP helper — attaches JWT token to every request automatically
// ---------------------------------------------------------------------------

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Attempt token refresh on 401
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with the new token
      headers.Authorization = `Bearer ${localStorage.getItem('access_token')}`;
      return fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    } else {
      // Refresh failed — force logout
      localStorage.clear();
      window.location.href = '/login';
    }
  }

  return response;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return true;
  } catch {
    return false;
  }
}


// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authService = {
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('access_token',  data.access);
      localStorage.setItem('refresh_token', data.refresh);
    }
    return { ok: res.ok, data };
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    await request('/token/blacklist/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
    localStorage.clear();
  },
};


// ---------------------------------------------------------------------------
// Job Requests
// ---------------------------------------------------------------------------

export const jobService = {
  /**
   * Submit a new job request.
   *
   * What happens behind the scenes:
   * 1. Django saves the JobRequest to PostgreSQL.
   * 2. Django calls the FastAPI ML service with the job details
   *    and all eligible workers.
   * 3. FastAPI returns the ranked worker list.
   * 4. Django returns BOTH the saved job request AND the ranked list
   *    to this function in a single response.
   *
   * The frontend receives matched_workers ready to display —
   * no second API call needed.
   *
   * @param {Object} jobData - { title, description, category, budget_min,
   *                            budget_max, location_lat, location_lng,
   *                            location_address, preferred_start_date }
   * @returns {{ job_request, matched_workers, total_matches }}
   */
  submitJobRequest: async (jobData) => {
    const res = await request('/job-requests/', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
  },

  getMyJobRequests: async () => {
    const res = await request('/job-requests/');
    return res.json();
  },

  getJobRequestDetail: async (id) => {
    const res = await request(`/job-requests/${id}/`);
    return res.json();
  },

  cancelJobRequest: async (id) => {
    const res = await request(`/job-requests/${id}/cancel/`, { method: 'PATCH' });
    return { ok: res.ok, data: await res.json() };
  },

  markCompleted: async (id) => {
    const res = await request(`/job-requests/${id}/complete/`, { method: 'PATCH' });
    return { ok: res.ok, data: await res.json() };
  },
};


// ---------------------------------------------------------------------------
// Job Offers
// ---------------------------------------------------------------------------

export const offerService = {
  /**
   * Resident sends a formal job offer to one selected worker.
   *
   * @param {string} requestId  - UUID of the JobRequest
   * @param {string} workerId   - UUID of the selected WorkerProfile
   * @param {number} matchScore - composite_score from the ML result (optional)
   */
  sendOffer: async (requestId, workerId, matchScore = null) => {
    const res = await request('/job-offers/', {
      method: 'POST',
      body: JSON.stringify({
        request_id:  requestId,
        worker_id:   workerId,
        match_score: matchScore,
      }),
    });
    return { ok: res.ok, data: await res.json() };
  },

  respondToOffer: async (offerId, action) => {
    const res = await request(`/job-offers/${offerId}/respond/`, {
      method: 'POST',
      body: JSON.stringify({ action }),  // "accept" or "decline"
    });
    return { ok: res.ok, data: await res.json() };
  },

  getMyOffers: async () => {
    const res = await request('/job-offers/');
    return res.json();
  },
};


// ---------------------------------------------------------------------------
// Ratings
// ---------------------------------------------------------------------------

export const ratingService = {
  submitRating: async ({ offerId, ratedUserId, score, reviewText }) => {
    const res = await request('/ratings/', {
      method: 'POST',
      body: JSON.stringify({
        offer_id:    offerId,
        rated_user:  ratedUserId,
        score,
        review_text: reviewText,
      }),
    });
    return { ok: res.ok, data: await res.json() };
  },
};


// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notificationService = {
  getAll: async () => {
    const res = await request('/notifications/');
    return res.json();
  },

  markRead: async (id) => {
    const res = await request(`/notifications/${id}/read/`, { method: 'PATCH' });
    return { ok: res.ok };
  },

  dismiss: async (id) => {
    const res = await request(`/notifications/${id}/`, { method: 'DELETE' });
    return { ok: res.ok };
  },
};


// ---------------------------------------------------------------------------
// Workers (Admin + Resident browsing)
// ---------------------------------------------------------------------------

export const workerService = {
  getAll: async () => {
    const res = await request('/workers/');
    return res.json();
  },

  getProfile: async (id) => {
    const res = await request(`/workers/${id}/`);
    return res.json();
  },
};