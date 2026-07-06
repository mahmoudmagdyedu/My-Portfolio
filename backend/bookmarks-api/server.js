import express from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, 'data', 'bookmarks.json');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

async function readBookmarks() {
  const contents = await readFile(dataFile, 'utf8');
  return JSON.parse(contents);
}

async function saveBookmarks(bookmarks) {
  await writeFile(dataFile, `${JSON.stringify(bookmarks, null, 2)}\n`);
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => String(tag).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

function validateBookmark(payload, partial = false) {
  const errors = [];

  if (!partial || payload.title !== undefined) {
    if (!payload.title || String(payload.title).trim().length < 2) {
      errors.push('title must be at least 2 characters');
    }
  }

  if (!partial || payload.url !== undefined) {
    if (!payload.url || !isValidUrl(payload.url)) {
      errors.push('url must be a valid URL');
    }
  }

  return errors;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bookmarks-api' });
});

app.get('/api/bookmarks', async (req, res, next) => {
  try {
    const bookmarks = await readBookmarks();
    res.json(bookmarks);
  } catch (error) {
    next(error);
  }
});

app.get('/api/bookmarks/:id', async (req, res, next) => {
  try {
    const bookmarks = await readBookmarks();
    const bookmark = bookmarks.find((item) => item.id === req.params.id);

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    return res.json(bookmark);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/bookmarks', async (req, res, next) => {
  try {
    const errors = validateBookmark(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const bookmarks = await readBookmarks();
    const now = new Date().toISOString();
    const bookmark = {
      id: randomUUID(),
      title: String(req.body.title).trim(),
      url: String(req.body.url).trim(),
      description: String(req.body.description || '').trim(),
      tags: normalizeTags(req.body.tags),
      createdAt: now,
      updatedAt: now
    };

    bookmarks.unshift(bookmark);
    await saveBookmarks(bookmarks);

    return res.status(201).json(bookmark);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/bookmarks/:id', async (req, res, next) => {
  try {
    const errors = validateBookmark(req.body, true);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const bookmarks = await readBookmarks();
    const index = bookmarks.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    const current = bookmarks[index];
    const updated = {
      ...current,
      title: req.body.title === undefined ? current.title : String(req.body.title).trim(),
      url: req.body.url === undefined ? current.url : String(req.body.url).trim(),
      description:
        req.body.description === undefined
          ? current.description
          : String(req.body.description).trim(),
      tags: req.body.tags === undefined ? current.tags : normalizeTags(req.body.tags),
      updatedAt: new Date().toISOString()
    };

    bookmarks[index] = updated;
    await saveBookmarks(bookmarks);

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/bookmarks/:id', async (req, res, next) => {
  try {
    const bookmarks = await readBookmarks();
    const nextBookmarks = bookmarks.filter((item) => item.id !== req.params.id);

    if (nextBookmarks.length === bookmarks.length) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await saveBookmarks(nextBookmarks);

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
  console.log(`Bookmarks API listening on http://localhost:${port}`);
});
