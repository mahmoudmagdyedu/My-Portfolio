import express from 'express';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, 'data', 'links.json');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

async function readLinks() {
  return JSON.parse(await readFile(dataFile, 'utf8'));
}

async function saveLinks(links) {
  await writeFile(dataFile, `${JSON.stringify(links, null, 2)}\n`);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function createCode() {
  return randomBytes(4).toString('base64url').toLowerCase();
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'url-shortener-api' });
});

app.get('/api/links', async (req, res, next) => {
  try {
    res.json(await readLinks());
  } catch (error) {
    next(error);
  }
});

app.post('/api/links', async (req, res, next) => {
  try {
    const { url, code } = req.body;
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'url must be a valid http or https URL' });
    }

    const links = await readLinks();
    const shortCode = String(code || createCode()).trim().toLowerCase();
    if (!/^[a-z0-9_-]{4,24}$/.test(shortCode)) {
      return res.status(400).json({ error: 'code must be 4-24 letters, numbers, underscores, or hyphens' });
    }
    if (links.some((link) => link.code === shortCode)) {
      return res.status(409).json({ error: 'code is already in use' });
    }

    const link = { code: shortCode, url: String(url).trim(), createdAt: new Date().toISOString(), clicks: 0 };
    links.unshift(link);
    await saveLinks(links);
    return res.status(201).json({ ...link, shortUrl: `${req.protocol}://${req.get('host')}/s/${link.code}` });
  } catch (error) {
    return next(error);
  }
});

app.get('/s/:code', async (req, res, next) => {
  try {
    const links = await readLinks();
    const link = links.find((item) => item.code === req.params.code.toLowerCase());
    if (!link) return res.status(404).json({ error: 'short link not found' });

    link.clicks += 1;
    await saveLinks(links);
    return res.redirect(302, link.url);
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`URL Shortener API listening on http://localhost:${port}`);
});
