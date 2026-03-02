// src/data/mockData.js
import { Wrench, Zap, Hammer, Sparkles, Paintbrush, CheckCircle2, Clock, XCircle } from 'lucide-react';

export const STATIC_USERS = [
  {
    id: '1',
    email: 'admin@skilllink.com',
    password: 'admin123',
    full_name: 'Barangay Admin',
    role: 'admin',
  },
  {
    id: '2',
    email: 'worker@skilllink.com',
    password: 'worker123',
    full_name: 'Juan Dela Cruz',
    role: 'worker',
  },
  {
    id: '3',
    email: 'resident@skilllink.com',
    password: 'resident123',
    full_name: 'Maria Santos',
    role: 'resident',
  },
];

export const MOCK_STATS = {
  workers: 15,
  pending: 3,
  requests: 24
};

export const MOCK_WORKERS = [
  { 
    id: 1, 
    full_name: "Juan Dela Cruz", 
    service: "Plumbing",
    location: "Brgy. 12, Carmen", 
    availability: "Weekdays",
    experience_years: 5, 
    hourly_rate: 250, 
    rating: 4.8, 
    is_verified: true, 
    skills: ["Plumbing", "Pipe Fitting"] 
  },
  { 
    id: 2, 
    full_name: "Pedro Reyes", 
    service: "Carpentry",
    location: "Brgy. 40, Nazareth",
    availability: "Weekends",
    experience_years: 3, 
    hourly_rate: 200, 
    rating: 4.5, 
    is_verified: true, 
    skills: ["Carpentry", "Furniture"] 
  },
  { 
    id: 3, 
    full_name: "Carlo Mendez", 
    service: "Painting",
    location: "Brgy. 3, Poblacion",
    availability: "Flexible",
    experience_years: 1, 
    hourly_rate: 150, 
    rating: 0, 
    is_verified: false, 
    skills: ["Painting"] 
  }
];

export const MOCK_REQUESTS = [
  { id: 1, customer_name: "Maria Santos", service_type: "Plumbing", status: "pending", assigned_worker: null, created_at: new Date().toISOString() },
  { id: 2, customer_name: "Ana Lim", service_type: "Electrical", status: "matched", assigned_worker: "Juan Dela Cruz", created_at: new Date().toISOString() }
];

// ── Form Option Data ──
export const SERVICE_CATEGORIES = [
  {
    value: 'Plumbing', label: 'Plumbing', icon: Wrench,
    color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20',
    problems: [
      'Leaking pipe or faucet', 'Clogged drain or toilet',
      'Water heater issue', 'Low water pressure',
      'Broken toilet flush', 'Pipe installation', 'Other plumbing issue',
    ],
  },
  {
    value: 'Electrical', label: 'Electrical', icon: Zap,
    color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20',
    problems: [
      'Power outlet not working', 'Circuit breaker tripping',
      'Flickering lights', 'Electrical wiring repair',
      'Fan or AC installation', 'Panel upgrade or inspection', 'Other electrical issue',
    ],
  },
  {
    value: 'Carpentry', label: 'Carpentry', icon: Hammer,
    color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20',
    problems: [
      'Door or window repair', 'Cabinet installation or repair',
      'Flooring installation', 'Roof or ceiling repair',
      'Furniture assembly', 'Shelving or storage build', 'Other carpentry issue',
    ],
  },
  {
    value: 'Cleaning', label: 'Cleaning', icon: Sparkles,
    color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20',
    problems: [
      'General house cleaning', 'Deep cleaning',
      'Post-construction cleanup', 'Window cleaning',
      'Carpet or upholstery cleaning', 'Other cleaning service',
    ],
  },
  {
    value: 'Painting', label: 'Painting', icon: Paintbrush,
    color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    problems: [
      'Interior wall painting', 'Exterior wall painting',
      'Ceiling painting', 'Furniture repainting',
      'Touch-up painting', 'Other painting work',
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
  { value: 'emergency', label: 'Emergency',  desc: 'Needs immediate attention' },
  { value: 'urgent',    label: 'Urgent',     desc: 'Within 24–48 hours'        },
  { value: 'normal',    label: 'Normal',     desc: 'Within the week'           },
  { value: 'flexible',  label: 'Flexible',   desc: 'No rush, anytime works'    },
];

export const SCHEDULE_OPTIONS = [
  { value: 'asap',     label: 'As Soon As Possible' },
  { value: 'weekdays', label: 'Weekdays Only'        },
  { value: 'weekends', label: 'Weekends Only'        },
  { value: 'flexible', label: 'Flexible / Any Time'  },
];

// ── Blank form state ──
export const BLANK_FORM = {
  service_category: '',
  specific_problem: '',
  budget_range:     '',
  urgency:          '',
  schedule:         '',
  location:         '',
  notes:            '',
};

export const SERVICE_CONFIG = {
  Plumbing:   { icon: Wrench,     color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20'     },
  Electrical: { icon: Zap,        color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20'   },
  Carpentry:  { icon: Hammer,     color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
  Painting:   { icon: Paintbrush, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20'},
  Cleaning:   { icon: Sparkles,   color: 'text-sky-500',     bg: 'bg-sky-50 dark:bg-sky-900/20'       },
};

export const SERVICE_FILTERS = ['All', 'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning'];


// ── Static job history data (replace with api calls in future) ──
export const JOB_HISTORY = [
  {
    id: 1, title: 'Pipe Leak Repair',       service: 'Plumbing',
    resident: 'Maria Santos',  location: 'Brgy. 12, Carmen',
    date: '2026-02-25', status: 'completed', pay: 450, rating: 5,
  },
  {
    id: 2, title: 'Circuit Breaker Fix',     service: 'Electrical',
    resident: 'Ana Lim',       location: 'Brgy. 40, Nazareth',
    date: '2026-02-22', status: 'completed', pay: 600, rating: 4,
  },
  {
    id: 3, title: 'Cabinet Installation',   service: 'Carpentry',
    resident: 'Jose Reyes',    location: 'Brgy. 3, Poblacion',
    date: '2026-02-20', status: 'completed', pay: 800, rating: 5,
  },
  {
    id: 4, title: 'Bathroom Tile Grouting', service: 'Plumbing',
    resident: 'Linda Cruz',    location: 'Brgy. 6, Lapasan',
    date: '2026-02-18', status: 'cancelled', pay: 0,   rating: null,
  },
  {
    id: 5, title: 'Outlet Replacement',     service: 'Electrical',
    resident: 'Ramon Torres',  location: 'Brgy. 25, Macasandig',
    date: '2026-02-15', status: 'completed', pay: 350, rating: 4,
  },
  {
    id: 6, title: 'Roof Gutter Repair',     service: 'Carpentry',
    resident: 'Cita Flores',   location: 'Brgy. 10, Consolacion',
    date: '2026-02-10', status: 'in_progress', pay: 700, rating: null,
  },
];

export const STATUS_CONFIG = {
  completed:   { label: 'Completed',   icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20',   badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  in_progress: { label: 'In Progress', icon: Clock,        color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/20',         badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  cancelled:   { label: 'Cancelled',   icon: XCircle,      color: 'text-red-500 dark:text-red-400',         bg: 'bg-red-50 dark:bg-red-900/20',           badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export const SKILL_OPTIONS = [
  'Plumbing', 'Pipe Fitting', 'Water Heater', 'Drain Cleaning',
  'Electrical', 'Wiring', 'Circuit Breaker', 'Panel Upgrade',
  'Carpentry', 'Cabinet Making', 'Roofing', 'Flooring',
  'Painting', 'Cleaning', 'Welding', 'Masonry', 'Tiling',
];

export const SERVICE_ICONS = { 
  Plumbing: Wrench, 
  Electrical: Zap, 
  Carpentry: Hammer, 
  Painting: Paintbrush 
};

// A default profile for the mock state
export const MOCK_PROFILE = {
  full_name: 'Juan Dela Cruz',
  phone: '09XX-XXX-XXXX',
  address: 'Brgy. 12, Carmen, CDO',
  bio: 'Experienced plumber with 5+ years of residential and commercial experience.',
  experience_years: 5,
  hourly_rate: 250,
  skills: ['Plumbing', 'Pipe Fitting', 'Water Heater'],
  availability: 'weekdays',
};