import bcrypt from "bcryptjs";
import db from "./index.js";
import { createTables } from "./schema.js";

export function seed() {
  createTables();

  const existingUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (existingUsers.count > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  const hash = bcrypt.hashSync("password123", 10);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, neighborhood, role, show_profile, show_contributions, show_location)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    ["Meera S.", "meera@mend.in", hash, "Palasia", "user", 1, 1, 1],
    ["Ravi K.", "ravi@mend.in", hash, "Vijay Nagar", "moderator", 1, 1, 0],
    ["Priya T.", "priya@mend.in", hash, "MR-10", "user", 1, 1, 0],
    ["Karan M.", "karan@mend.in", hash, "Sapna Sangeeta", "user", 1, 1, 0],
    ["Admin", "admin@mend.in", hash, "Indore", "admin", 0, 0, 0],
  ];

  for (const u of users) {
    insertUser.run(...u);
  }

  const insertResource = db.prepare(`
    INSERT INTO resources (name, category, description, neighborhood, contact, submitted_by, submitter_name, status, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const resources = [
    ["Palasia Repair Café", "Donate", "Free monthly clinic for small appliances, electronics, and torn clothing.", "Palasia", "meera@mend.in", 1, "Meera S.", "approved", 1],
    ["Vijay Nagar Tool Library", "Borrow", "Borrow power tools, ladders, and gardening equipment for up to a week.", "Vijay Nagar", "ravi@mend.in", 2, "Ravi K.", "approved", 1],
    ["Rajwada Furniture Exchange", "Refuse", "Drop off or claim second-hand furniture — no cost, first come first served.", "Rajwada", "", null, "Anonymous", "approved", 1],
    ["Sudama Nagar E-Waste Point", "Donate", "Responsible drop-off for old phones, cables, and batteries.", "Sudama Nagar", "", null, "Anonymous", "approved", 1],
    ["Bengali Square Sewing Circle", "Repair", "Volunteer tailors mend clothes and bags every Sunday morning.", "Bengali Square", "", null, "Anonymous", "approved", 1],
    ["Sapna Sangeeta Book Swap", "Refuse", "Bring a book, take a book — an open shelf outside the community hall.", "Sapna Sangeeta", "karan.m@gmail.com", 4, "Karan M.", "pending", 0],
    ["MR-10 Baby Gear Lending", "Borrow", "Borrow prams, cots, carriers — return when you're done. Free for families.", "MR-10", "priya.t@email.com", null, "Priya T.", "pending", 0],
    ["Annapurna Donation Box", "Donate", "Drop clean clothing and blankets for redistribution to shelters nearby.", "Annapurna", "", null, "anon-291", "flagged", 0],
  ];

  for (const r of resources) {
    insertResource.run(...r);
  }

  const insertEvent = db.prepare(`
    INSERT INTO events (type, name, date, time, location, description, organizer, organizer_id, capacity, participants)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const events = [
    ["Workshop", "Saturday Repair Café", "Aug 3", "10:00 AM – 1:00 PM", "Palasia Community Hall", "Bring your broken appliances — volunteers will help you fix them or teach you how. Small electronics, clothing, bags welcome.", "Meera S.", 1, 18, 14],
    ["Tool Share", "Tool Library Induction", "Aug 7", "6:00 PM – 7:30 PM", "Vijay Nagar Tool Library", "New to the tool library? Join this induction to learn how the lending system works, what tools are available, and how to book them.", "Ravi K.", 2, 14, 6],
    ["Donation Drive", "E-Waste Collection Drive", "Aug 10", "9:00 AM – 4:00 PM", "Sudama Nagar Park", "Drop off your old phones, laptops, cables, and batteries. All items responsibly recycled. No questions asked.", "GreenIndore", null, 200, 32],
    ["Workshop", "Sewing & Darning Basics", "Aug 14", "3:00 PM – 5:00 PM", "Bengali Square Community Room", "Learn basic hand-sewing, how to mend holes and tears, and how to replace buttons. Bring a garment to practice on.", "Sunita D.", null, 12, 7],
    ["Volunteer", "Furniture Exchange Setup", "Aug 17", "8:00 AM – 11:00 AM", "Rajwada Exchange Point", "Help us reorganize the furniture exchange space before the seasonal surge. Involves light lifting and some labelling work.", "Rajwada Collective", null, 8, 3],
    ["Donation Drive", "Winter Clothing Drive", "Aug 22", "10:00 AM – 3:00 PM", "Annapurna Temple Gate", "Donate clean winter clothing, blankets, and warm items for redistribution to shelters ahead of the cool season.", "Annapurna Trust", null, 100, 18],
  ];

  for (const e of events) {
    insertEvent.run(...e);
  }

  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, type, title, body, mention, read)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const notifications: [number, string, string, string, number, number][] = [
    [1, "approval", 'Submission verified ✓', '"Palasia Repair Café" has been verified by a community moderator and is now live on the map.', 0, 0],
    [1, "event", "New repair workshop nearby", "A new workshop has been posted at Vijay Nagar Tool Library on Aug 3. 4 spots remaining.", 0, 0],
    [1, "volunteer", "Volunteer request", "Rajwada Furniture Exchange is looking for a weekend coordinator. You volunteered last month — interested?", 1, 0],
    [1, "feedback", "Moderator feedback", '"Bengali Square Sewing Circle" needs a contact name added before it can be verified. Edit your submission.', 0, 1],
    [2, "approval", "Submission accepted", '"Sudama Nagar E-Waste Point" has been accepted and added to the pending queue for verification.', 0, 1],
    [2, "search", "Search alert: Baby gear", 'A new "Borrow" resource matching your saved search "baby gear" was added in MR-10.', 1, 1],
    [2, "event", "E-waste collection drive", "Community drive this Saturday at Sudama Nagar Park. Bring old electronics — no questions asked.", 0, 1],
    [2, "volunteer", "Event reminder", 'You registered for "Saturday Repair Café" — it starts tomorrow at 10:00 AM at Palasia.', 0, 1],
  ];

  for (const n of notifications) {
    insertNotification.run(...n);
  }

  const insertBadge = db.prepare(`
    INSERT INTO badges (name, description, icon, badge_key)
    VALUES (?, ?, ?, ?)
  `);

  const badges = [
    ["First Fix", "Submitted your first repair resource", "🔧", "first_fix"],
    ["Mapper", "Submitted 5+ resources to the network", "🗺️", "mapper"],
    ["Verified", "Had 3 submissions verified by moderators", "✓", "verified"],
    ["Volunteer", "Attended a community repair event", "♥", "volunteer"],
    ["Explorer", "Visited 10 resources on the map", "◉", "explorer"],
    ["Champion", "Top contributor in your neighborhood", "⭐", "champion"],
  ];

  for (const b of badges) {
    insertBadge.run(...b);
  }

  const insertActivity = db.prepare(`
    INSERT INTO activities (user_id, type, description)
    VALUES (?, ?, ?)
  `);

  const activities: [number, string, string][] = [
    [1, "verification", 'Your submission "Palasia Repair Café" was verified ✓'],
    [1, "event", "New repair workshop posted in Vijay Nagar — 3 km away"],
    [1, "save", 'You saved "Sudama Nagar E-Waste Point" to your list'],
    [1, "mod_feedback", 'Moderator left feedback on "Bengali Square Sewing Circle"'],
    [1, "volunteer", "Volunteer request from Rajwada Furniture Exchange"],
  ];

  for (const a of activities) {
    insertActivity.run(...a);
  }

  const insertUserStats = db.prepare(`
    INSERT INTO user_stats (user_id, resources_added, items_repaired, waste_diverted_kg, carbon_saved_kg, events_attended, badges_earned)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertUserStats.run(1, 12, 47, 230, 89, 3, 4);

  const insertUserBadge = db.prepare(`
    INSERT OR IGNORE INTO user_badges (user_id, badge_id)
    VALUES (?, ?)
  `);

  insertUserBadge.run(1, 1);
  insertUserBadge.run(1, 2);
  insertUserBadge.run(1, 3);
  insertUserBadge.run(1, 4);

  const insertSaved = db.prepare(`
    INSERT INTO saved_resources (user_id, resource_id)
    VALUES (?, ?)
  `);

  insertSaved.run(1, 2);
  insertSaved.run(1, 4);
  insertSaved.run(1, 5);
  insertSaved.run(1, 3);

  const insertRegistration = db.prepare(`
    INSERT INTO event_registrations (event_id, user_id)
    VALUES (?, ?)
  `);

  insertRegistration.run(1, 1);

  console.log("Database seeded successfully!");
}

seed();
