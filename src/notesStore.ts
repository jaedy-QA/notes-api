import crypto from 'crypto';
import { Note, CreateNoteInput, UpdateNoteInput } from '../../shared-types/src/index.js';

// In-memory notes store
const notesStore = new Map<string, Note>();

// Pre-seed sample notes for demo user ('user_demo_101')
const seedNotes: Note[] = [
  {
    id: 'note_101',
    userId: 'user_demo_101',
    title: 'Playwright Test Strategy',
    content: 'Review multi-repository test generation and automated selector mapping for notes app.',
    category: 'Work',
    isArchived: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 'note_102',
    userId: 'user_demo_101',
    title: 'Grocery List',
    content: 'Milk, Eggs, Whole grain bread, Coffee beans, Almonds, Green tea.',
    category: 'Personal',
    isArchived: false,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'note_103',
    userId: 'user_demo_101',
    title: 'Old Q3 Sprint Planning',
    content: 'Legacy planning document from previous quarter. Preserved for reference.',
    category: 'Work',
    isArchived: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString()
  }
];

seedNotes.forEach((note) => notesStore.set(note.id, note));

export const NotesRepository = {
  /**
   * Get all non-deleted notes for a specific user, with optional search query & status filter
   * Business Rule: Deleted notes MUST NOT appear in search results or lists
   * Business Rule: Users can ONLY access their own notes
   */
  getUserNotes(userId: string, filter?: { search?: string; status?: 'active' | 'archived' | 'all' }): Note[] {
    const userNotes: Note[] = [];
    const query = filter?.search?.trim().toLowerCase() || '';
    const status = filter?.status || 'all';

    for (const note of notesStore.values()) {
      // Rule: User restriction
      if (note.userId !== userId) continue;

      // Rule: Deleted notes hidden
      if (note.isDeleted) continue;

      // Status filter
      if (status === 'active' && note.isArchived) continue;
      if (status === 'archived' && !note.isArchived) continue;

      // Search matching (title, content, category)
      if (query) {
        const titleMatch = note.title.toLowerCase().includes(query);
        const contentMatch = note.content.toLowerCase().includes(query);
        const categoryMatch = note.category.toLowerCase().includes(query);
        if (!titleMatch && !contentMatch && !categoryMatch) continue;
      }

      userNotes.push(note);
    }

    // Sort by updated time descending
    return userNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  /**
   * Get single note by ID for a user
   */
  getNoteById(id: string, userId: string): Note | undefined {
    const note = notesStore.get(id);
    if (!note || note.userId !== userId || note.isDeleted) {
      return undefined;
    }
    return note;
  },

  /**
   * Create new note
   */
  createNote(userId: string, input: CreateNoteInput): Note {
    const id = 'note_' + crypto.randomBytes(6).toString('hex');
    const now = new Date().toISOString();

    const newNote: Note = {
      id,
      userId,
      title: input.title.trim(),
      content: input.content.trim(),
      category: input.category || 'General',
      isArchived: false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    notesStore.set(id, newNote);
    return newNote;
  },

  /**
   * Update note
   * Business Rule: Archived notes CANNOT be edited
   */
  updateNote(id: string, userId: string, input: UpdateNoteInput): Note {
    const note = this.getNoteById(id, userId);
    if (!note) {
      throw new Error('Note not found or access denied');
    }

    // Business Rule Check: Archived notes cannot be edited
    if (note.isArchived) {
      throw new Error('Archived notes cannot be edited. Please restore the note first.');
    }

    const updatedNote: Note = {
      ...note,
      title: input.title !== undefined ? input.title.trim() : note.title,
      content: input.content !== undefined ? input.content.trim() : note.content,
      category: input.category !== undefined ? input.category : note.category,
      updatedAt: new Date().toISOString()
    };

    notesStore.set(id, updatedNote);
    return updatedNote;
  },

  /**
   * Archive note
   */
  archiveNote(id: string, userId: string): Note {
    const note = this.getNoteById(id, userId);
    if (!note) {
      throw new Error('Note not found or access denied');
    }

    note.isArchived = true;
    note.updatedAt = new Date().toISOString();
    notesStore.set(id, note);
    return note;
  },

  /**
   * Restore note from archive
   */
  restoreNote(id: string, userId: string): Note {
    const note = this.getNoteById(id, userId);
    if (!note) {
      throw new Error('Note not found or access denied');
    }

    note.isArchived = false;
    note.updatedAt = new Date().toISOString();
    notesStore.set(id, note);
    return note;
  },

  /**
   * Delete note (soft delete so deleted notes do not appear in queries/search)
   */
  deleteNote(id: string, userId: string): void {
    const note = this.getNoteById(id, userId);
    if (!note) {
      throw new Error('Note not found or access denied');
    }

    note.isDeleted = true;
    note.updatedAt = new Date().toISOString();
    notesStore.set(id, note);
  }
};
