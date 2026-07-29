import { Router, Request, Response, NextFunction } from 'express';
import { NotesRepository } from './notesStore.js';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ success: false, error: 'Authentication required. Missing token.' });
    return;
  }

  try {
    const authRes = await fetch(`${AUTH_SERVICE_URL}/api/auth/me`, {
      headers: { Authorization: authHeader }
    });
    const json = await authRes.json();

    if (!authRes.ok || !json.success) {
      res.status(401).json({ success: false, error: json.error || 'Authentication failed. Invalid token.' });
      return;
    }

    (req as any).userId = json.data.user.id;
    next();
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Authentication service unavailable.' });
  }
}

export const notesRouter = Router();

// Apply auth middleware to all routes in notesRouter
notesRouter.use(requireAuth);

// GET /api/notes
notesRouter.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const search = req.query.search as string | undefined;
    const status = req.query.status as 'active' | 'archived' | 'all' | undefined;

    const notes = NotesRepository.getUserNotes(userId, { search, status });
    res.json({ success: true, data: notes });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch notes' });
  }
});

// GET /api/notes/:id
notesRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const note = NotesRepository.getNoteById(req.params.id, userId);

    if (!note) {
      res.status(404).json({ success: false, error: 'Note not found or access denied.' });
      return;
    }

    res.json({ success: true, data: note });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch note' });
  }
});

// POST /api/notes
notesRouter.post('/', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, content, category } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, error: 'Title is required.' });
      return;
    }

    const note = NotesRepository.createNote(userId, { title, content: content || '', category });
    res.status(201).json({ success: true, data: note });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to create note' });
  }
});

// PUT /api/notes/:id
notesRouter.put('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, content, category } = req.body;

    const updated = NotesRepository.updateNote(req.params.id, userId, { title, content, category });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to update note' });
  }
});

// PATCH /api/notes/:id/archive
notesRouter.patch('/:id/archive', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const archived = NotesRepository.archiveNote(req.params.id, userId);
    res.json({ success: true, data: archived });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to archive note' });
  }
});

// PATCH /api/notes/:id/restore
notesRouter.patch('/:id/restore', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const restored = NotesRepository.restoreNote(req.params.id, userId);
    res.json({ success: true, data: restored });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to restore note' });
  }
});

// DELETE /api/notes/:id
notesRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    NotesRepository.deleteNote(req.params.id, userId);
    res.json({ success: true, data: { message: 'Note deleted successfully' } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message || 'Failed to delete note' });
  }
});
