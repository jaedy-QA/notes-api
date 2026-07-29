import express from 'express';
import { notesRouter } from './notesController.js';

const app = express();
app.use(express.json());

app.use('/api/notes', notesRouter);

export { notesRouter };

const PORT = process.env.NOTES_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Notes API running on port ${PORT}`);
});
