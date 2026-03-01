export const MOCK_STATS = {
  workers: 15,
  pending: 3,
  requests: 24
};

export const MOCK_WORKERS = [
  { id: 1, full_name: "Juan Dela Cruz", email: "juan@example.com", experience_years: 5, hourly_rate: 250, rating: 4.8, is_verified: true, skills: ["Plumbing", "Electrical"] },
  { id: 2, full_name: "Pedro Reyes", email: "pedro@example.com", experience_years: 3, hourly_rate: 200, rating: 4.5, is_verified: true, skills: ["Carpentry"] },
  { id: 3, full_name: "Carlo Mendez", email: "carlo@example.com", experience_years: 1, hourly_rate: 150, rating: 0, is_verified: false, skills: ["Painting"] }
];

export const MOCK_REQUESTS = [
  { id: 1, customer_name: "Maria Santos", service_type: "Plumbing", status: "pending", assigned_worker: null, created_at: new Date().toISOString() },
  { id: 2, customer_name: "Ana Lim", service_type: "Electrical", status: "matched", assigned_worker: "Juan Dela Cruz", created_at: new Date().toISOString() }
];