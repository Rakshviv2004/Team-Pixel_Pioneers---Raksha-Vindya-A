export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  neighborhood: string;
  bio: string;
  avatar_url: string;
  role: "user" | "moderator" | "admin";
  location_permission: "denied" | "approximate" | "precise";
  theme: "system" | "light" | "dark";
  language: string;
  show_profile: number;
  show_contributions: number;
  show_location: number;
  reduced_motion: number;
  large_text: number;
  high_contrast: number;
  notif_new_nearby: number;
  notif_approvals: number;
  notif_events: number;
  notif_volunteers: number;
  notif_moderator: number;
  created_at: string;
  updated_at: string;
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
  status: "pending" | "approved" | "rejected" | "flagged";
  verified: number;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
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
  organizer_id: number | null;
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

export interface Activity {
  id: number;
  user_id: number;
  type: string;
  description: string;
  created_at: string;
}

export interface UserStats {
  user_id: number;
  resources_added: number;
  items_repaired: number;
  waste_diverted_kg: number;
  carbon_saved_kg: number;
  events_attended: number;
  badges_earned: number;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  badge_key: string;
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
