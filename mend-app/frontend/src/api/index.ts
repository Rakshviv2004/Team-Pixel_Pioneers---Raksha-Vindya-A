const API_BASE = import.meta.env.VITE_API_URL || "/api";

function token(): string | null {
  return localStorage.getItem("mend_token");
}

function authHeaders(): Record<string, string> {
  const t = token();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.error || `Request failed with status ${res.status}`) as Error & { status: number; details: unknown };
    err.status = res.status;
    err.details = data.details;
    throw err;
  }

  return data as T;
}

export interface AuthResponse {
  token: string;
  user: { id: number; name: string; email: string; role: string };
}

export interface Resource {
  id: number;
  name: string;
  category: string;
  description: string;
  neighborhood: string;
  contact: string;
  submitted_by: number | null;
  submitter_name: string;
  status: string;
  verified: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  is_saved?: boolean;
}

export interface Event {
  id: number;
  type: string;
  name: string;
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
  capacity: number;
  participants: number;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  mention: number;
  read: number;
  created_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  neighborhood: string;
  bio: string;
  role: string;
  created_at: string;
}

export interface UserStats {
  resources_added: number;
  items_repaired: number;
  waste_diverted_kg: number;
  carbon_saved_kg: number;
  events_attended: number;
  badges_earned: number;
}

export interface PaginatedResponse<T> {
  resources?: T[];
  events?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const api = {
  // Auth
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<{ user: UserProfile }>("/auth/me"),

  // Resources
  getResources: (params?: { search?: string; category?: string; status?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.category) q.set("category", params.category);
    if (params?.status) q.set("status", params.status);
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    return request<{ resources: Resource[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>(
      `/resources${q.toString() ? `?${q.toString()}` : ""}`
    );
  },

  getResource: (id: number) => request<{ resource: Resource }>(`/resources/${id}`),

  createResource: (data: { name: string; category: string; description: string; neighborhood: string; contact?: string }) =>
    request<{ resource: Resource }>("/resources", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateResource: (id: number, data: Partial<Resource>) =>
    request<{ resource: Resource }>(`/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteResource: (id: number) =>
    request<{ message: string }>(`/resources/${id}`, { method: "DELETE" }),

  toggleSaveResource: (id: number) =>
    request<{ saved: boolean }>(`/resources/${id}/save`, { method: "POST" }),

  // Events
  getEvents: () => request<{ events: Event[] }>("/events"),

  getEvent: (id: number) => request<{ event: Event }>(`/events/${id}`),

  toggleEventRegistration: (id: number) =>
    request<{ registered: boolean }>(`/events/${id}/register`, { method: "POST" }),

  // Notifications
  getNotifications: (filter?: string) =>
    request<{ notifications: Notification[]; unreadCount: number }>(
      `/notifications${filter ? `?filter=${filter}` : ""}`
    ),

  markNotificationRead: (id: number) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: "PUT" }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>("/notifications/read-all", { method: "PUT" }),

  // User
  getProfile: () => request<{ user: UserProfile; stats: UserStats }>("/user/profile"),

  updateProfile: (data: Record<string, unknown>) =>
    request<{ user: UserProfile }>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getContributions: () =>
    request<{ activities: unknown[]; resources: Resource[]; registrations: unknown[] }>("/user/contributions"),

  getBadges: () => request<{ badges: Array<Record<string, unknown> & { earned: boolean }> }>("/user/badges"),

  getSavedResources: () => request<{ resources: Resource[] }>("/user/saved"),

  getStats: () => request<{ stats: UserStats; pendingSubmissions: number; resourcesAdded: number }>("/user/stats"),

  // Moderator
  getSubmissions: (params?: { status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    return request<{ submissions: Resource[]; stats: Record<string, number> }>(
      `/moderator/submissions${q.toString() ? `?${q.toString()}` : ""}`
    );
  },

  approveSubmission: (id: number) =>
    request<{ resource: Resource }>(`/moderator/submissions/${id}/approve`, { method: "PUT" }),

  rejectSubmission: (id: number) =>
    request<{ resource: Resource }>(`/moderator/submissions/${id}/reject`, { method: "PUT" }),

  updateSubmission: (id: number, data: Record<string, unknown>) =>
    request<{ resource: Resource }>(`/moderator/submissions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
