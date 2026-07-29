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
