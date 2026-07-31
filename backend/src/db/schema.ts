import db from "./index.js";

export function createTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      neighborhood TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      location_permission TEXT DEFAULT 'denied',
      theme TEXT DEFAULT 'system',
      language TEXT DEFAULT 'English',
      show_profile INTEGER DEFAULT 1,
      show_contributions INTEGER DEFAULT 1,
      show_location INTEGER DEFAULT 0,
      reduced_motion INTEGER DEFAULT 0,
      large_text INTEGER DEFAULT 0,
      high_contrast INTEGER DEFAULT 0,
      notif_new_nearby INTEGER DEFAULT 1,
      notif_approvals INTEGER DEFAULT 1,
      notif_events INTEGER DEFAULT 1,
      notif_volunteers INTEGER DEFAULT 0,
      notif_moderator INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      neighborhood TEXT NOT NULL,
      contact TEXT DEFAULT '',
      submitted_by INTEGER REFERENCES users(id),
      submitter_name TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      verified INTEGER DEFAULT 0,
      latitude REAL,
      longitude REAL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      organizer TEXT NOT NULL,
      organizer_id INTEGER REFERENCES users(id),
      capacity INTEGER NOT NULL DEFAULT 20,
      participants INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER REFERENCES events(id),
      user_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(event_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      mention INTEGER DEFAULT 0,
      read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      resource_id INTEGER REFERENCES resources(id),
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, resource_id)
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      user_id INTEGER PRIMARY KEY REFERENCES users(id),
      resources_added INTEGER DEFAULT 0,
      items_repaired INTEGER DEFAULT 0,
      waste_diverted_kg REAL DEFAULT 0,
      carbon_saved_kg REAL DEFAULT 0,
      events_attended INTEGER DEFAULT 0,
      badges_earned INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      badge_key TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      user_id INTEGER REFERENCES users(id),
      badge_id INTEGER REFERENCES badges(id),
      earned_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, badge_id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
