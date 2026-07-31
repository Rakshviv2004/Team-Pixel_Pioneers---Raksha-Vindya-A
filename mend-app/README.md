# Mend — Community Repair & Reuse Network

A community platform for finding nearby repair shops, reuse exchanges, donation points, and borrowing libraries — with a moderation queue, events, alerts, and user impact tracking.

- **Frontend:** React 19 + Vite 8 + Tailwind CSS v4 (TypeScript)
- **Backend:** Node.js + Express + SQLite (better-sqlite3), JWT auth
- **Database:** SQLite (auto-created and seeded on first run — no setup needed)

---

## Prerequisites

- **Node.js** >= 20.19 (Node 22 LTS recommended — see `.nvmrc`)

## Quick start (one command)

```bash
npm install     # installs frontend + backend + tooling
npm run dev     # starts API (:4000) and web app (:5173) together
```

Then open **http://localhost:5173** — the database is created and seeded automatically on first start.

## Useful commands

| Command            | What it does                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`      | Run API + web app together (watch mode)        |
| `npm run dev:api`  | Run only the backend API                       |
| `npm run dev:web`  | Run only the frontend                          |
| `npm run build`    | Type-check + production build for both         |
| `npm run seed`     | Reset / re-seed the database with demo data    |
| `npm run start`    | Serve the built backend (`backend/dist`)       |

## Demo accounts

| Role      | Email             | Password      |
| --------- | ----------------- | ------------- |
| User      | `meera@mend.in`   | `password123` |
| Moderator | `ravi@mend.in`    | `password123` |
| Admin     | `admin@mend.in`   | `password123` |

## Configuration (optional)

| Env var             | Default               | Used by    |
| ------------------- | --------------------- | ---------- |
| `PORT`              | `5173`                | Frontend   |
| `API_URL`           | `http://localhost:4000` | Frontend proxy target |
| `PORT` (backend)    | `4000`                | Backend    |
| `JWT_SECRET`        | `mend-community-network-secret-key-2025` | Backend |
| `DATABASE_PATH`     | `./data/mend.db`      | Backend    |

## Project structure

```
mend-app/
├── package.json          # Workspace root: installs + runs everything
├── frontend/             # React + Vite + Tailwind app
│   ├── src/
│   │   ├── App.tsx       # Shell: nav, routing, auth state, report modal
│   │   ├── api/          # Typed API client
│   │   └── pages/        # Home, Auth, Dashboard, Events, Alerts, Moderator, Profile, Settings
│   └── vite.config.ts    # Dev server + /api proxy → backend
└── backend/              # Express + SQLite API
    └── src/
        ├── db/           # schema.ts, seed.ts, connection
        ├── middleware/   # JWT auth (user / moderator / admin)
        ├── routes/       # auth, resources, events, notifications, user, moderator
        └── types/        # Shared TypeScript types
```

## API overview

| Method | Endpoint                          | Auth         | Description                          |
| ------ | --------------------------------- | ------------ | ------------------------------------ |
| POST   | `/api/auth/register`              | —            | Create account                       |
| POST   | `/api/auth/login`                 | —            | Login, returns JWT                   |
| GET    | `/api/auth/me`                    | Bearer       | Current user                         |
| GET    | `/api/resources`                  | optional     | Search/filter/paginate approved list |
| POST   | `/api/resources`                  | Bearer       | Submit a resource (→ moderation)     |
| PUT    | `/api/resources/:id`              | Bearer       | Edit own resource                    |
| DELETE | `/api/resources/:id`              | Bearer       | Delete own resource                  |
| POST   | `/api/resources/:id/save`         | Bearer       | Toggle bookmark                      |
| GET    | `/api/events`                     | —            | List events                          |
| POST   | `/api/events/:id/register`        | Bearer       | Toggle event registration            |
| GET    | `/api/notifications`              | Bearer       | Alerts (Unread/Mentions filters)     |
| PUT    | `/api/notifications/read-all`     | Bearer       | Mark all read                        |
| GET    | `/api/moderator/submissions`      | Moderator    | Moderation queue + stats             |
| PUT    | `/api/moderator/submissions/:id/approve` | Moderator | Approve a submission            |
| PUT    | `/api/moderator/submissions/:id/reject`  | Moderator | Reject a submission             |
| GET    | `/api/user/profile`               | Bearer       | Profile + settings + stats           |
| PUT    | `/api/user/profile`               | Bearer       | Update settings/profile              |
| GET    | `/api/user/badges`                | Bearer       | Badge list with earned state          |
| GET    | `/api/user/saved`                 | Bearer       | Bookmarked resources                 |
