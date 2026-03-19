// src/services/api.js
import {
  MOCK_WORKERS, MOCK_REQUESTS, MOCK_STATS,
  WEEKLY_DATA, SKILL_BREAKDOWN, ML_MATCH_LOGS,
  ACTIVITY_FEED, MOCK_PROFILE, WORKER_STATS,
  JOB_HISTORY, MOCK_INCOMING_JOB, MOCK_ACTIVE_JOB,
  RESIDENT_REQUESTS, INITIAL_NOTIFICATIONS,
  MOCK_RESIDENTS,
} from '../data/mockData';

// Set to true for demo / set to false for live backend 
const USE_MOCK = true;

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

//  Internal HTTP helper — used only when USE_MOCK = false
async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) options.body = JSON.stringify(body);

  const res  = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
}

//  Mock helper — simulates async latency (optional, set ms > 0)
function mock(data, delayMs = 0) {
  return delayMs > 0
    ? new Promise((res) => setTimeout(() => res(data), delayMs))
    : Promise.resolve(data);
}

//  API SURFACE
export const api = {
  

  // ADMIN — Stats & Dashboard
  // KPI counts for AdminDashboard cards.
  getStats: () =>
    USE_MOCK
      ? mock(MOCK_STATS)
      : request('GET', '/stats'),

  // 7-day requests vs completed data for BarChart.
  getWeeklyStats: () =>
    USE_MOCK
      ? mock(WEEKLY_DATA)
      : request('GET', '/stats/weekly'),

  //Service category breakdown for the admin skill panel.
  getSkillBreakdown: () =>
    USE_MOCK
      ? mock(SKILL_BREAKDOWN)
      : request('GET', '/stats/skills'),

  // ML engine match log entries for AdminDashboard panel.
  getMatchLogs: () =>
    USE_MOCK
      ? mock(ML_MATCH_LOGS)
      : request('GET', '/matches/logs'),

  //Live activity feed events for AdminDashboard.
  getActivityFeed: () =>
    USE_MOCK
      ? mock(ACTIVITY_FEED)
      : request('GET', '/activity'),

  // ADMIN — Workers
  // All workers for Admin Workers page and Resident Directory.
  getWorkers: () =>
    USE_MOCK
      ? mock(MOCK_WORKERS)
      : request('GET', '/workers'),

  // Verify or un-verify a worker.
  verifyWorker: (id, isVerified) =>
    USE_MOCK
      ? mock({ id, is_verified: isVerified })
      : request('PATCH', `/workers/${id}/verify`, { is_verified: isVerified }),

  // Suspend or un-suspend a worker.
  suspendWorker: (id, isSuspended) =>
    USE_MOCK
      ? mock({ id, is_suspended: isSuspended })
      : request('PATCH', `/workers/${id}/suspend`, { is_suspended: isSuspended }),

  // Add a new worker (admin manual registration).
  addWorker: (body) =>
    USE_MOCK
      ? mock({ id: Date.now(), ...body })
      : request('POST', '/workers', body),

  getResidents: () =>
  USE_MOCK
    ? mock(MOCK_RESIDENTS)
    : request('GET', '/residents'),

  verifyResident: (id, isVerified) =>
  USE_MOCK
    ? mock({ id, is_verified: isVerified })
    : request('PATCH', `/residents/${id}/verify`, { is_verified: isVerified }),

  // ADMIN — Requests
  // All service requests for Admin Requests page and AdminDashboard.
  getRequests: () =>
    USE_MOCK
      ? mock(MOCK_REQUESTS)
      : request('GET', '/requests'),

  //Update a request's status (pending → matched → in_progress → completed).
  updateRequestStatus: (id, status) =>
    USE_MOCK
      ? mock({ id, status })
      : request('PATCH', `/requests/${id}/status`, { status }),

  // Create a new service request (from Resident portal).
  createRequest: (body) =>
    USE_MOCK
      ? mock({ id: Date.now(), status: 'pending', ...body })
      : request('POST', '/requests', body),


  // WORKER PORTAL
  // Logged-in worker's profile for WorkerProfile page.
  getProfile: () =>
    USE_MOCK
      ? mock(MOCK_PROFILE)
      : request('GET', '/profile'),

  // Update worker profile fields.
  updateProfile: (data) =>
    USE_MOCK
      ? mock(data)
      : request('PUT', '/profile', data),

  // D-04: Update worker's day-level availability schedule.
  // ERD: WORKER_PROFILE.availability_schedule (JSON array of day strings)
  // API v1.1: PATCH /worker/availability-schedule
  updateAvailabilitySchedule: (days) =>
    USE_MOCK
      ? mock({ availability_schedule: days })
      : request('PATCH', '/worker/availability-schedule', { availability_schedule: days }),

  // Aggregated stats for WorkerDashboard summary pills.
  getWorkerStats: () =>
    USE_MOCK
      ? mock(WORKER_STATS)
      : request('GET', '/worker/stats'),

  // Job history list for WorkerHistory page.
  getJobHistory: () =>
    USE_MOCK
      ? mock(JOB_HISTORY)
      : request('GET', '/jobs/history'),

  // Current incoming match for WorkerDashboard 'incoming' state.
  getIncomingJob: () =>
    USE_MOCK
      ? mock(MOCK_INCOMING_JOB)
      : request('GET', '/worker/match/pending'),

  // Currently active (accepted) job for WorkerDashboard 'active' state.
  getActiveJob: () =>
    USE_MOCK
      ? mock(MOCK_ACTIVE_JOB)
      : request('GET', '/worker/job/active'),

  // Worker accepts an incoming match.
  acceptMatch: (matchId) =>
    USE_MOCK
      ? mock({ matchId, accepted: true })
      : request('POST', `/worker/match/${matchId}/accept`),

  // Worker declines an incoming match.
  declineMatch: (matchId) =>
    USE_MOCK
      ? mock({ matchId, declined: true })
      : request('POST', `/worker/match/${matchId}/decline`),

  // Worker marks current job as complete.
  markJobComplete: (jobId) =>
    USE_MOCK
      ? mock({ jobId, completed: true })
      : request('POST', `/worker/job/${jobId}/complete`),

  // Worker toggles online/offline availability.
  setWorkerOnlineStatus: (isOnline) =>
    USE_MOCK
      ? mock({ is_online: isOnline })
      : request('PATCH', '/worker/status', { is_online: isOnline }),


  // RESIDENT PORTAL
  // Service requests made by the logged-in resident.
  getResidentRequests: () =>
    USE_MOCK
      ? mock(RESIDENT_REQUESTS)
      : request('GET', '/resident/requests'),

  // Submit a rating for a completed job.
  submitRating: (data) =>
    USE_MOCK
      ? mock({ success: true, ...data })
      : request('POST', '/ratings', data),


  // NOTIFICATIONS (all portals)
  // Unread + recent notifications for NotificationBell.
  getNotifications: () =>
    USE_MOCK
      ? mock(INITIAL_NOTIFICATIONS)
      : request('GET', '/notifications'),

  // Mark a single notification as read.
  markNotificationRead: (id) =>
    USE_MOCK
      ? mock({ id, read: true })
      : request('PATCH', `/notifications/${id}/read`),

  // Dismiss (delete) a notification.
  dismissNotification: (id) =>
    USE_MOCK
      ? mock({ id, dismissed: true })
      : request('DELETE', `/notifications/${id}`),
};