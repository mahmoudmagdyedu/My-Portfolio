import express from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, 'data', 'notes.json');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

async function readNotes() {
  const contents = await readFile(dataFile, 'utf8');
  return JSON.parse(contents);
}

async function saveNotes(notes) {
  await writeFile(dataFile, `${JSON.stringify(notes, null, 2)}\n`);
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

function validateNote(payload, partial = false) {
  const errors = [];

  if (!partial || payload.title !== undefined) {
    if (!payload.title || String(payload.title).trim().length < 2) {
      errors.push('title must be at least 2 characters');
    }
  }

  if (!partial || payload.body !== undefined) {
    if (!payload.body || String(payload.body).trim().length < 5) {
      errors.push('body must be at least 5 characters');
    }
  }

  return errors;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'notes-api' });
});

app.get('/api/notes', async (req, res, next) => {
  try {
    const notes = await readNotes();
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

app.get('/api/notes/:id', async (req, res, next) => {
  try {
    const notes = await readNotes();
    const note = notes.find((item) => item.id === req.params.id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json(note);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/notes', async (req, res, next) => {
  try {
    const errors = validateNote(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const notes = await readNotes();
    const now = new Date().toISOString();
    const note = {
      id: randomUUID(),
      title: String(req.body.title).trim(),
      body: String(req.body.body).trim(),
      tags: normalizeTags(req.body.tags),
      archived: false,
      createdAt: now,
      updatedAt: now
    };

    notes.unshift(note);
    await saveNotes(notes);

    return res.status(201).json(note);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/notes/:id', async (req, res, next) => {
  try {
    const errors = validateNote(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const notes = await readNotes();
    const index = notes.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const current = notes[index];
    const updated = {
      ...current,
      title: req.body.title === undefined ? current.title : String(req.body.title).trim(),
      body: req.body.body === undefined ? current.body : String(req.body.body).trim(),
      tags: req.body.tags === undefined ? current.tags : normalizeTags(req.body.tags),
      archived:
        req.body.archived === undefined ? current.archived : Boolean(req.body.archived),
      updatedAt: new Date().toISOString()
    };

    notes[index] = updated;
    await saveNotes(notes);

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const notes = await readNotes();
    const nextNotes = notes.filter((item) => item.id !== req.params.id);

    if (nextNotes.length === notes.length) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await saveNotes(nextNotes);

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`Notes API listening on http://localhost:${port}`);
});
