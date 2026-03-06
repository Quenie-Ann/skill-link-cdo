/**
 * src/data/mockData.js
 *
 * CENTRALIZED MOCK DATABASE FOR DEVELOPMENT & TESTING
 *
 * This file contains all the hardcoded mock data used across the application.
 * 
 * Sections:
 *  1. Auth          — STATIC_USERS
 *  2. Workers       — MOCK_WORKERS (Admin + Resident Directory)
 *  3. Requests      — MOCK_REQUESTS (Admin Requests page)
 *  4. Admin Stats   — MOCK_STATS, WEEKLY_DATA, SKILL_BREAKDOWN
 *  5. ML Engine     — ML_MATCH_LOGS
 *  6. Activity Feed — ACTIVITY_FEED
 *  7. Worker Portal — MOCK_PROFILE, JOB_HISTORY, WORKER_STATS
 *  8. Resident      — RESIDENT_REQUESTS
 *  9. Notifications — INITIAL_NOTIFICATIONS
 * 10. Form Config   — SERVICE_CATEGORIES, BUDGET_RANGES, etc.
 * 11. Display Config — STATUS_CONFIG, SERVICE_CONFIG, etc.
 */

import {
  Wrench, Zap, Hammer, Sparkles, Paintbrush,
  CheckCircle2, Clock, XCircle,
  Users, ShieldCheck, ClipboardList, Star,
} from 'lucide-react';



//  1. AUTH
//  Used by: auth.js → Login.jsx, App.jsx
export const STATIC_USERS = [
  {
    id:        '1',
    email:     'admin@skilllink.com',
    password:  'admin123',
    full_name: 'Barangay Admin',
    role:      'admin',
  },
  {
    id:        '2',
    email:     'worker@skilllink.com',
    password:  'worker123',
    full_name: 'Juan Dela Cruz',
    role:      'worker',
  },
  {
    id:        '3',
    email:     'resident@skilllink.com',
    password:  'resident123',
    full_name: 'Maria Santos',
    role:      'resident',
  },
];



//  2. WORKERS
//  Used by: Admin › Workers.jsx, Admin › Dashboard.jsx,
//           Resident › Directory.jsx
export const MOCK_WORKERS = [
  {
    id:               1,
    full_name:        'Juan Dela Cruz',
    service:          'Plumbing',
    phone:            '09171234567',
    location:         'Brgy. 12, Carmen, CDO',
    availability:     'Weekdays',
    experience_years: 5,
    hourly_rate:      250,
    rating:           4.8,
    jobs_done:        12,
    is_verified:      true,
    is_suspended:     false,
    skills:           ['Plumbing', 'Pipe Fitting', 'Water Heater'],
    submitted_at:     '2026-02-10T08:00:00Z',
    documents: {
      government_id:      'submitted',
      barangay_clearance: 'submitted',
    },
    bio: 'Experienced plumber with 5+ years of residential and commercial work in CDO.',
  },
  {
    id:               2,
    full_name:        'Pedro Reyes',
    service:          'Carpentry',
    phone:            '09189876543',
    location:         'Brgy. 40, Nazareth, CDO',
    availability:     'Weekends',
    experience_years: 3,
    hourly_rate:      200,
    rating:           4.5,
    jobs_done:        8,
    is_verified:      true,
    is_suspended:     false,
    skills:           ['Carpentry', 'Furniture', 'Roofing'],
    submitted_at:     '2026-02-12T09:30:00Z',
    documents: {
      government_id:      'submitted',
      barangay_clearance: 'submitted',
    },
    bio: 'Skilled carpenter specializing in furniture and home improvement.',
  },
  {
    id:               3,
    full_name:        'Carlo Mendez',
    service:          'Painting',
    phone:            '09201112222',
    location:         'Brgy. 3, Poblacion, CDO',
    availability:     'Flexible',
    experience_years: 1,
    hourly_rate:      150,
    rating:           0,
    jobs_done:        0,
    is_verified:      false,
    is_suspended:     false,
    skills:           ['Painting'],
    submitted_at:     '2026-03-01T11:00:00Z',
    documents: {
      government_id:      'submitted',
      barangay_clearance: 'pending',
    },
    bio: 'Aspiring painter looking for opportunities to grow in the trade.',
  },
  {
    id:               4,
    full_name:        'Rosa Lim',
    service:          'Electrical',
    phone:            '09263334444',
    location:         'Brgy. 6, Lapasan, CDO',
    availability:     'Weekdays',
    experience_years: 7,
    hourly_rate:      300,
    rating:           4.9,
    jobs_done:        21,
    is_verified:      true,
    is_suspended:     false,
    skills:           ['Electrical', 'Wiring', 'Circuit Breaker', 'Panel Upgrade'],
    submitted_at:     '2026-01-20T07:00:00Z',
    documents: {
      government_id:      'submitted',
      barangay_clearance: 'submitted',
    },
    bio: '7-year licensed electrician with commercial and residential experience.',
  },
  {
    id:               5,
    full_name:        'Ben Torres',
    service:          'Carpentry',
    phone:            '09175556666',
    location:         'Brgy. 25, Macasandig, CDO',
    availability:     'Weekdays',
    experience_years: 9,
    hourly_rate:      280,
    rating:           4.7,
    jobs_done:        34,
    is_verified:      true,
    is_suspended:     false,
    skills:           ['Carpentry', 'Cabinet Making', 'Flooring', 'Roofing'],
    submitted_at:     '2025-12-15T08:00:00Z',
    documents: {
      government_id:      'submitted',
      barangay_clearance: 'submitted',
    },
    bio: 'Senior carpenter with 9 years handling large residential projects.',
  },
  {
    id:               6,
    full_name:        'Ana Gomez',
    service:          'Cleaning',
    phone:            '09307778888',
    location:         'Brgy. 10, Consolacion, CDO',
    availability:     'Flexible',
    experience_years: 2,
    hourly_rate:      120,
    rating:           4.2,
    jobs_done:        5,
    is_verified:      false,
    is_suspended:     true,
    skills:           ['Cleaning', 'Deep Cleaning'],
    submitted_at:     '2026-02-28T10:00:00Z',
    documents: {
      government_id:      'submitted',
      barangay_clearance: 'submitted',
    },
    bio: 'Reliable cleaner available for residential and post-construction jobs.',
  },
];


//  3. SERVICE REQUESTS
//  Used by: Admin › Requests.jsx, Admin › Dashboard.jsx
//           Resident › Dashboard.jsx (filtered by resident)
export const MOCK_REQUESTS = [
  {
    id:              1,
    customer_name:   'Maria Santos',
    service_type:    'Plumbing',
    problem:         'Leaking pipe or faucet',
    location:        'Blk 3 Lot 7, Purok 5, Brgy. 12, Carmen, CDO',
    budget:          '₱300 – ₱500/hr',
    urgency:         'urgent',
    schedule:        'Weekdays',
    status:          'pending',
    assigned_worker: null,
    created_at:      new Date(Date.now() - 2 * 60000).toISOString(),    // 2 min ago
  },
  {
    id:              2,
    customer_name:   'Ana Lim',
    service_type:    'Electrical',
    problem:         'Circuit breaker tripping',
    location:        'Unit 4B, Purok 2, Brgy. 40, Nazareth, CDO',
    budget:          '₱200 – ₱300/hr',
    urgency:         'normal',
    schedule:        'Flexible',
    status:          'matched',
    assigned_worker: 'Rosa Lim',
    created_at:      new Date(Date.now() - 30 * 60000).toISOString(),   // 30 min ago
  },
  {
    id:              3,
    customer_name:   'Grace Villanueva',
    service_type:    'Carpentry',
    problem:         'Door or window repair',
    location:        'Purok 3, Brgy. 10, Consolacion, CDO',
    budget:          '₱300 – ₱500/hr',
    urgency:         'flexible',
    schedule:        'Weekends',
    status:          'in_progress',
    assigned_worker: 'Ben Torres',
    created_at:      new Date(Date.now() - 3 * 3600000).toISOString(),  // 3 hrs ago
  },
  {
    id:              4,
    customer_name:   'Carlo Bautista',
    service_type:    'Electrical',
    problem:         'Power outlet not working',
    location:        'Brgy. 25, Macasandig, CDO',
    budget:          '₱200 – ₱300/hr',
    urgency:         'urgent',
    schedule:        'Weekdays',
    status:          'completed',
    assigned_worker: 'Rosa Lim',
    created_at:      new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
  },
  {
    id:              5,
    customer_name:   'Linda Cruz',
    service_type:    'Plumbing',
    problem:         'Clogged drain or toilet',
    location:        'Brgy. 6, Lapasan, CDO',
    budget:          'Under ₱200/hr',
    urgency:         'emergency',
    schedule:        'Weekdays',
    status:          'cancelled',
    assigned_worker: null,
    created_at:      new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
  },
];


//  4. ADMIN STATS & CHARTS
//  Used by: Admin › Dashboard.jsx

/** KPI card counts — computed from MOCK_WORKERS / MOCK_REQUESTS in api.js,
 *  but also exported here as a flat object for direct fallback use. */
export const MOCK_STATS = {
  workers:         MOCK_WORKERS.length,
  pending:         MOCK_WORKERS.filter((w) => !w.is_verified && !w.is_suspended).length,
  requests:        MOCK_REQUESTS.length,
  completed:       MOCK_REQUESTS.filter((r) => r.status === 'completed').length,
  completion_rate: Math.round(
    (MOCK_REQUESTS.filter((r) => r.status === 'completed').length / MOCK_REQUESTS.length) * 100
  ),
};

/** 7-day requests vs completed chart */
export const WEEKLY_DATA = [
  { day: 'Mon', requests: 8,  completed: 5  },
  { day: 'Tue', requests: 14, completed: 10 },
  { day: 'Wed', requests: 6,  completed: 4  },
  { day: 'Thu', requests: 19, completed: 15 },
  { day: 'Fri', requests: 11, completed: 8  },
  { day: 'Sat', requests: 7,  completed: 6  },
  { day: 'Sun', requests: 4,  completed: 3  },
];

/** Service mix breakdown for admin overview */
export const SKILL_BREAKDOWN = [
  { label: 'Plumbing',    count: 12, pct: 85, color: 'bg-blue-400'   },
  { label: 'Electrical',  count: 9,  pct: 64, color: 'bg-amber-400'  },
  { label: 'Carpentry',   count: 7,  pct: 50, color: 'bg-orange-400' },
  { label: 'Painting',    count: 5,  pct: 36, color: 'bg-purple-400' },
  { label: 'Cleaning',    count: 4,  pct: 29, color: 'bg-pink-400'   },
  { label: 'Others',      count: 6,  pct: 43, color: 'bg-gray-400'   },
];



//  5. ML ENGINE — MATCH LOGS
//  Used by: Admin › Dashboard.jsx (ML Match Log panel)
export const ML_MATCH_LOGS = [
  {
    id:         1,
    requestId:  'REQ-042',
    resident:   'Maria Santos',
    service:    'Plumbing',
    topMatch:   { name: 'Juan Dela Cruz', score: 94 },
    candidates: [
      { name: 'Juan Dela Cruz', score: 94 },
      { name: 'Pedro Reyes',    score: 78 },
      { name: 'Ana Gomez',      score: 61 },
    ],
    assignedAt: '2 min ago',
  },
  {
    id:         2,
    requestId:  'REQ-041',
    resident:   'Carlo Bautista',
    service:    'Electrical',
    topMatch:   { name: 'Rosa Lim', score: 88 },
    candidates: [
      { name: 'Rosa Lim',         score: 88 },
      { name: 'Mark Tan',         score: 74 },
      { name: 'Lito Dela Cruz',   score: 55 },
    ],
    assignedAt: '18 min ago',
  },
  {
    id:         3,
    requestId:  'REQ-040',
    resident:   'Grace Villanueva',
    service:    'Carpentry',
    topMatch:   { name: 'Ben Torres', score: 91 },
    candidates: [
      { name: 'Ben Torres',   score: 91 },
      { name: 'Jun Macaraeg', score: 69 },
      { name: 'Eddie Cruz',   score: 52 },
    ],
    assignedAt: '1 hr ago',
  },
];


//  6. ACTIVITY FEED
//  Used by: Admin › Dashboard.jsx (Live Feed panel)
export const ACTIVITY_FEED = [
  {
    id:    1,
    icon:  Users,
    bg:    'bg-emerald-50 dark:bg-emerald-900/20',
    color: 'text-emerald-600 dark:text-emerald-400',
    title: 'New Signup',
    sub:   'Worker Registration',
    time:  'Just now',
  },
  {
    id:    2,
    icon:  Zap,
    bg:    'bg-blue-50 dark:bg-blue-900/20',
    color: 'text-blue-600 dark:text-blue-400',
    title: 'Match Made',
    sub:   'REQ-042 → Juan C.',
    time:  '2m ago',
  },
  {
    id:    3,
    icon:  CheckCircle2,
    bg:    'bg-skill-primary/10',
    color: 'text-skill-primary',
    title: 'Job Completed',
    sub:   'Plumbing · Brgy. 12',
    time:  '14m ago',
  },
  {
    id:    4,
    icon:  ShieldCheck,
    bg:    'bg-amber-50 dark:bg-amber-900/20',
    color: 'text-amber-600 dark:text-amber-400',
    title: 'Worker Verified',
    sub:   'Rosa Lim approved',
    time:  '31m ago',
  },
  {
    id:    5,
    icon:  ClipboardList,
    bg:    'bg-purple-50 dark:bg-purple-900/20',
    color: 'text-purple-600 dark:text-purple-400',
    title: 'New Request',
    sub:   'Electrical · Nazareth',
    time:  '1h ago',
  },
  {
    id:    6,
    icon:  Clock,
    bg:    'bg-gray-50 dark:bg-dark-bg',
    color: 'text-gray-400',
    title: 'System Start',
    sub:   'Server connected',
    time:  'On startup',
  },
];


//  7. WORKER PORTAL
//  Used by: Worker › Dashboard.jsx, History.jsx, Profile.jsx

/** Logged-in worker profile */
export const MOCK_PROFILE = {
  full_name:        'Juan Dela Cruz',
  phone:            '09171234567',
  address:          'Brgy. 12, Carmen, CDO',
  bio:              'Experienced plumber with 5+ years of residential and commercial experience.',
  experience_years: 5,
  hourly_rate:      250,
  rating:           4.8,
  jobs_done:        12,
  tier:             'Gold',
  is_verified:      true,
  skills:           ['Plumbing', 'Pipe Fitting', 'Water Heater'],
  availability:     'weekdays',
  service:          'Plumbing',
  documents: {
    government_id:      'submitted',
    barangay_clearance: 'submitted',
  },
};

/** Worker summary stats (derived from history in Phase 2) */
export const WORKER_STATS = {
  total_earned:     2200,
  completed:        10,
  avg_rating:       4.8,
  completion_rate:  92,
  weekly_jobs:      [
    { day: 'M', count: 2 },
    { day: 'T', count: 1 },
    { day: 'W', count: 3 },
    { day: 'T', count: 1 },
    { day: 'F', count: 2 },
    { day: 'S', count: 0 },
    { day: 'S', count: 1 },
  ],
};

/** Job history for WorkerHistory page */
export const JOB_HISTORY = [
  {
    id:       1,
    title:    'Pipe Leak Repair',
    service:  'Plumbing',
    resident: 'Maria Santos',
    location: 'Brgy. 12, Carmen',
    date:     '2026-02-25',
    status:   'completed',
    pay:      450,
    rating:   5,
  },
  {
    id:       2,
    title:    'Circuit Breaker Fix',
    service:  'Electrical',
    resident: 'Ana Lim',
    location: 'Brgy. 40, Nazareth',
    date:     '2026-02-22',
    status:   'completed',
    pay:      600,
    rating:   4,
  },
  {
    id:       3,
    title:    'Cabinet Installation',
    service:  'Carpentry',
    resident: 'Jose Reyes',
    location: 'Brgy. 3, Poblacion',
    date:     '2026-02-20',
    status:   'completed',
    pay:      800,
    rating:   5,
  },
  {
    id:       4,
    title:    'Bathroom Tile Grouting',
    service:  'Plumbing',
    resident: 'Linda Cruz',
    location: 'Brgy. 6, Lapasan',
    date:     '2026-02-18',
    status:   'cancelled',
    pay:      0,
    rating:   null,
  },
  {
    id:       5,
    title:    'Outlet Replacement',
    service:  'Electrical',
    resident: 'Ramon Torres',
    location: 'Brgy. 25, Macasandig',
    date:     '2026-02-15',
    status:   'completed',
    pay:      350,
    rating:   4,
  },
  {
    id:       6,
    title:    'Roof Gutter Repair',
    service:  'Carpentry',
    resident: 'Cita Flores',
    location: 'Brgy. 10, Consolacion',
    date:     '2026-02-10',
    status:   'in_progress',
    pay:      700,
    rating:   null,
  },
];

/** Incoming match for WorkerDashboard state: 'incoming' */
export const MOCK_INCOMING_JOB = {
  id:          'REQ-047',
  service:     'Plumbing',
  problem:     'Burst pipe under kitchen sink',
  description: 'Water is leaking heavily from the pipe under the kitchen sink. Needs immediate repair before it floods the floor.',
  resident: {
    name:    'Maria Santos',
    phone:   '09171234567',
    address: 'Blk 3 Lot 7, Purok 5, Brgy. 12, Carmen, CDO',
  },
  budget:      '₱500 – ₱1,000',
  schedule:    'Today, ASAP',
  distance:    '1.2 km away',
  match_score: 94,
  expires_in:  120, // seconds before job passes to next worker
};

/** Active job for WorkerDashboard state: 'active' */
export const MOCK_ACTIVE_JOB = {
  id:          'REQ-043',
  service:     'Plumbing',
  problem:     'Clogged drain in bathroom',
  resident: {
    name:    'Carlo Reyes',
    phone:   '09189876543',
    address: 'Unit 4B, Purok 2, Brgy. 40, Nazareth, CDO',
  },
  budget:      '₱300 – ₱500',
  accepted_at: '2:15 PM',
  distance:    '0.8 km away',
};


//  8. RESIDENT PORTAL
//  Used by: Resident › Dashboard.jsx, Directory.jsx

/** Recent requests for the logged-in resident */
export const RESIDENT_REQUESTS = [
  {
    id:      1,
    title:   'Electrical Repair',
    service: 'Electrical',
    status:  'in_progress',
    worker:  'Rosa Lim',
    date:    'Today, 2:30 PM',
    rating:  null,
  },
  {
    id:      2,
    title:   'Kitchen Plumbing',
    service: 'Plumbing',
    status:  'completed',
    worker:  'Juan Dela Cruz',
    date:    'Feb 24, 2026',
    rating:  null, // null = not yet rated → show Rate Now CTA
  },
  {
    id:      3,
    title:   'Roof Carpentry',
    service: 'Carpentry',
    status:  'completed',
    worker:  'Ben Torres',
    date:    'Feb 18, 2026',
    rating:  5,
  },
];


//  9. NOTIFICATIONS
//  Used by: NotificationBell.jsx (all portals)
export const INITIAL_NOTIFICATIONS = [
  {
    id:        1,
    type:      'worker_assigned',
    title:     'Worker Assigned',
    message:   'Juan Dela Cruz has been matched to your Electrical Repair request.',
    time:      '2 min ago',
    read:      false,
    icon:      CheckCircle2,
    iconBg:    'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id:        2,
    type:      'new_registration',
    title:     'New Worker Registration',
    message:   'Maria Santos submitted a registration and requires verification.',
    time:      '15 min ago',
    read:      false,
    icon:      Users,
    iconBg:    'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id:        3,
    type:      'job_complete',
    title:     'Job Marked Complete',
    message:   'Plumbing Repair at Brgy. 12 has been completed. Rate your experience!',
    time:      '1 hr ago',
    read:      false,
    icon:      Star,
    iconBg:    'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id:        4,
    type:      'request_update',
    title:     'Request Status Updated',
    message:   'Your Carpentry request is now In Progress.',
    time:      '3 hrs ago',
    read:      true,
    icon:      ClipboardList,
    iconBg:    'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
];


//  10. FORM CONFIGURATION
//  Used by: Resident › Dashboard.jsx (service request modal)
export const SERVICE_CATEGORIES = [
  {
    value:    'Plumbing',
    label:    'Plumbing',
    icon:     Wrench,
    color:    'text-blue-500',
    bg:       'bg-blue-50 dark:bg-blue-900/20',
    problems: [
      'Leaking pipe or faucet',
      'Clogged drain or toilet',
      'Water heater issue',
      'Low water pressure',
      'Broken toilet flush',
      'Pipe installation',
      'Other plumbing issue',
    ],
  },
  {
    value:    'Electrical',
    label:    'Electrical',
    icon:     Zap,
    color:    'text-amber-500',
    bg:       'bg-amber-50 dark:bg-amber-900/20',
    problems: [
      'Power outlet not working',
      'Circuit breaker tripping',
      'Flickering lights',
      'Electrical wiring repair',
      'Fan or AC installation',
      'Panel upgrade or inspection',
      'Other electrical issue',
    ],
  },
  {
    value:    'Carpentry',
    label:    'Carpentry',
    icon:     Hammer,
    color:    'text-orange-500',
    bg:       'bg-orange-50 dark:bg-orange-900/20',
    problems: [
      'Door or window repair',
      'Cabinet installation or repair',
      'Flooring installation',
      'Roof or ceiling repair',
      'Furniture assembly',
      'Shelving or storage build',
      'Other carpentry issue',
    ],
  },
  {
    value:    'Cleaning',
    label:    'Cleaning',
    icon:     Sparkles,
    color:    'text-sky-500',
    bg:       'bg-sky-50 dark:bg-sky-900/20',
    problems: [
      'General house cleaning',
      'Deep cleaning',
      'Post-construction cleanup',
      'Window cleaning',
      'Carpet or upholstery cleaning',
      'Other cleaning service',
    ],
  },
  {
    value:    'Painting',
    label:    'Painting',
    icon:     Paintbrush,
    color:    'text-emerald-500',
    bg:       'bg-emerald-50 dark:bg-emerald-900/20',
    problems: [
      'Interior wall painting',
      'Exterior wall painting',
      'Ceiling painting',
      'Furniture repainting',
      'Touch-up painting',
      'Other painting work',
    ],
  },
];

export const BUDGET_RANGES = [
  { value: 'under_200',  label: 'Under ₱200/hr'    },
  { value: '200_300',    label: '₱200 – ₱300/hr'   },
  { value: '300_500',    label: '₱300 – ₱500/hr'   },
  { value: 'above_500',  label: '₱500+/hr'          },
  { value: 'negotiable', label: 'Open / Negotiable' },
];

export const URGENCY_OPTIONS = [
  { value: 'emergency', label: 'Emergency', desc: 'Needs immediate attention' },
  { value: 'urgent',    label: 'Urgent',    desc: 'Within 24–48 hours'        },
  { value: 'normal',    label: 'Normal',    desc: 'Within the week'           },
  { value: 'flexible',  label: 'Flexible',  desc: 'No rush, anytime works'    },
];

export const SCHEDULE_OPTIONS = [
  { value: 'asap',     label: 'As Soon As Possible' },
  { value: 'weekdays', label: 'Weekdays Only'        },
  { value: 'weekends', label: 'Weekends Only'        },
  { value: 'flexible', label: 'Flexible / Any Time'  },
];

export const BLANK_FORM = {
  service_category: '',
  specific_problem: '',
  budget_range:     '',
  urgency:          '',
  schedule:         '',
  location:         '',
  notes:            '',
};

export const SKILL_OPTIONS = [
  'Plumbing', 'Pipe Fitting', 'Water Heater', 'Drain Cleaning',
  'Electrical', 'Wiring', 'Circuit Breaker', 'Panel Upgrade',
  'Carpentry', 'Cabinet Making', 'Roofing', 'Flooring',
  'Painting', 'Cleaning', 'Welding', 'Masonry', 'Tiling',
];


//  11. DISPLAY CONFIGURATION
//  Shared style maps used across multiple pages.
//  These are UI concerns, not data — kept here so
//  pages don't need to redefine the same objects.

/** Job/request status → badge + icon styles */
export const STATUS_CONFIG = {
  completed: {
    label:  'Completed',
    icon:   CheckCircle2,
    color:  'text-emerald-600 dark:text-emerald-400',
    bg:     'bg-emerald-50 dark:bg-emerald-900/20',
    badge:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  in_progress: {
    label:  'In Progress',
    icon:   Clock,
    color:  'text-blue-600 dark:text-blue-400',
    bg:     'bg-blue-50 dark:bg-blue-900/20',
    badge:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  cancelled: {
    label:  'Cancelled',
    icon:   XCircle,
    color:  'text-red-500 dark:text-red-400',
    bg:     'bg-red-50 dark:bg-red-900/20',
    badge:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  pending: {
    label:  'Pending',
    icon:   Clock,
    color:  'text-amber-600 dark:text-amber-400',
    bg:     'bg-amber-50 dark:bg-amber-900/20',
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  matched: {
    label:  'Matched',
    icon:   CheckCircle2,
    color:  'text-purple-600 dark:text-purple-400',
    bg:     'bg-purple-50 dark:bg-purple-900/20',
    badge:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  },
};

/** Service type → icon + color */
export const SERVICE_CONFIG = {
  Plumbing:   { icon: Wrench,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20'      },
  Electrical: { icon: Zap,        color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20'    },
  Carpentry:  { icon: Hammer,     color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20'  },
  Painting:   { icon: Paintbrush, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20'},
  Cleaning:   { icon: Sparkles,   color: 'text-sky-500',     bg: 'bg-sky-50 dark:bg-sky-900/20'        },
};

/** Filter pill labels for ResidentDirectory */
export const SERVICE_FILTERS = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning'];