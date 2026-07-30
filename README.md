# Notes API

Notes CRUD service for the Notes App.

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Start the service:

```bash
npm run dev
```

3. The service runs on port `3002` by default. If the auth service is not using the default host/port, set `AUTH_SERVICE_URL` before starting it.

This service depends on the auth service being available for token validation.

## What it provides

- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `PATCH /api/notes/:id/archive`
- `PATCH /api/notes/:id/restore`
- `DELETE /api/notes/:id`

## Business rules

- Notes are scoped to the authenticated user.
- Deleted notes are excluded from normal reads.
- Archived notes cannot be edited.

## Prerequisites

- Node.js 18+
- npm
- Auth service running on `http://localhost:3001` (unless overridden)

## Install

```bash
cd notes-api
npm install
```

## Run locally

```bash
npm run dev
```

The service runs on port `3002` by default. To use a different port:

```bash
NOTES_PORT=3003 npm run dev
```

If the auth service is not running on the default host/port, set:

```bash
AUTH_SERVICE_URL=http://localhost:3001 npm run dev
```

## Notes

- The service expects a valid bearer token from the auth service.
- If authentication fails, notes requests will return `401`.
