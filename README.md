# Notes API Repository (`notes-api`)

Notes CRUD service enforcing business rules and access controls.

## Features & Business Rules Enforced

- **Get Notes**: `GET /api/notes?search=&status=`
  - *Rule*: Returns only notes belonging to the logged-in user.
  - *Rule*: Excludes deleted notes completely from search & view.
- **Create Note**: `POST /api/notes`
- **Update Note**: `PUT /api/notes/:id`
  - *Rule*: Archived notes **cannot** be edited (returns 400 Bad Request error if user attempts to edit an archived note).
- **Archive Note**: `PATCH /api/notes/:id/archive`
- **Restore Note**: `PATCH /api/notes/:id/restore`
- **Delete Note**: `DELETE /api/notes/:id`

## Development

```bash
npm install
STANDALONE=true NOTES_PORT=3002 npm run start
```

---

Project-wide README (copied from repository root)

My Notes App
==============

A small microservice-based notes application with three services:

- `auth-service` — authentication (register, login, sessions)
- `notes-api` — notes CRUD API (requires authentication)
- `notes-frontend` — React + Vite frontend

This README explains how to clone, install, run the app locally, and troubleshoot common issues.

Prerequisites
-------------

- Node.js 18+ and npm
- Git
- Ports available (default):
  - Auth service: `3001`
  - Notes API: `3002`
  - Frontend (Vite): `5173`

If you need different ports, see the Environment section below.

Clone the repository
--------------------

```bash
git clone <repo-url> my-notes-app
cd my-notes-app
```

Install dependencies
--------------------

Run `npm install` in each service folder:

```bash
cd auth-service
npm install

cd ../notes-api
npm install

cd ../notes-frontend
npm install
```

Run (development)
-----------------

Start services (order is important: backend first):

1. Start auth service

```bash
cd auth-service
npm run dev
```

2. Start notes API

```bash
cd ../notes-api
npm run dev
```

3. Start the frontend

```bash
cd ../notes-frontend
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`).

Seeded accounts
---------------

The auth service seeds demo accounts in memory (see `auth-service/src/userStore.ts`):

- Demo user
  - Email: `demo@example.com`
  - Password: `password123`
- Northqa test user
  - Email: `test@qa.com`
  - Password: `testonly`

These accounts exist only in memory and are re-created each time the auth service starts.

Environment / Configuration
---------------------------

- `AUTH_SERVICE_URL` (optional) — used by `notes-api` to validate tokens against the auth service. Defaults to `http://localhost:3001`.
- Service ports can be changed by setting `AUTH_PORT` / `NOTES_PORT` env vars before starting the services.

Example (PowerShell):

```powershell
$env:AUTH_SERVICE_URL = "http://localhost:3001"
npm run dev  # from notes-api folder
```

Example (bash):

```bash
export AUTH_SERVICE_URL=http://localhost:3001
npm run dev  # from notes-api folder
```

Common issues & troubleshooting
-------------------------------

- Blank frontend (white page):
  - Ensure `notes-frontend/vite.config.ts` includes `@vitejs/plugin-react` and the Tailwind plugin.
  - Ensure `notes-frontend/tsconfig.json` has `"jsx": "react-jsx"`.

- `tsx` not recognized when running `npm run dev` in a service:
  - Make sure you ran `npm install` in that service folder to install `tsx` (dev dependency).

- Unexpected end of JSON input or invalid JSON responses from `/api/*` calls:
  - Make sure both backend services (`auth-service` and `notes-api`) are running. The frontend proxies API requests to those services during development.

- `Authentication failed. Invalid token` when creating notes:
  - Confirm `auth-service` is running and the `notes-api` can reach it. If the auth service uses a non-default port or host, set `AUTH_SERVICE_URL` for `notes-api`.

- Port conflicts:
  - If a port is in use, Vite may pick a different one — open the URL printed by the dev server.

Debugging tips
--------------

- Check the terminal where each service is running for logs and errors.
- In the browser, open DevTools and check Console and Network for failing requests and responses.
- Use `curl` or `httpie` to exercise backend endpoints directly (helpful to confirm whether auth/notes services are returning valid JSON):

```bash
curl -i http://localhost:3001/api/auth/me -H "Authorization: Bearer <token>"
```

Development notes
-----------------

- The backend services are intentionally lightweight and use in-memory stores for simplicity. Data is not persisted across restarts.
- If you want persistent data or to run services in containers, consider adding a DB and docker-compose in a future PR.

---

If you'd like, I can also add a `CONTRIBUTING.md`, Docker instructions, or a one-command script to start all services locally.
