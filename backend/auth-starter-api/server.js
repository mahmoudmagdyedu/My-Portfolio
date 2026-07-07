import express from 'express';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, 'data', 'users.json');
const sessions = new Map();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

async function readUsers() {
  const contents = await readFile(dataFile, 'utf8');
  return JSON.parse(contents);
}

async function saveUsers(users) {
  await writeFile(dataFile, `${JSON.stringify(users, null, 2)}\n`);
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = String(storedHash).split(':');
  if (!salt || !hash) return false;

  const candidate = hashPassword(password, salt).split(':')[1];
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(candidate, 'hex'));
}

function validateRegistration(payload) {
  const errors = [];
  const email = normalizeEmail(payload.email);

  if (!payload.name || String(payload.name).trim().length < 2) {
    errors.push('name must be at least 2 characters');
  }

  if (!email.includes('@') || email.length < 6) {
    errors.push('email must be valid');
  }

  if (!payload.password || String(payload.password).length < 8) {
    errors.push('password must be at least 8 characters');
  }

  return errors;
}

async function requireAuth(req, res, next) {
  try {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');

    if (!token || !sessions.has(token)) {
      return res.status(401).json({ error: 'Missing or invalid bearer token' });
    }

    const users = await readUsers();
    const user = users.find((item) => item.id === sessions.get(token));

    if (!user) {
      sessions.delete(token);
      return res.status(401).json({ error: 'User session no longer exists' });
    }

    req.token = token;
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-starter-api' });
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const errors = validateRegistration(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const users = await readUsers();
    const email = normalizeEmail(req.body.email);

    if (users.some((user) => user.email === email)) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const now = new Date().toISOString();
    const user = {
      id: randomUUID(),
      name: String(req.body.name).trim(),
      email,
      passwordHash: hashPassword(req.body.password),
      createdAt: now
    };

    users.push(user);
    await saveUsers(users);

    return res.status(201).json(publicUser(user));
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const users = await readUsers();
    const user = users.find((item) => item.email === email);

    if (!user || !verifyPassword(req.body.password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = randomBytes(32).toString('hex');
    sessions.set(token, user.id);

    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

app.delete('/api/auth/logout', requireAuth, (req, res) => {
  sessions.delete(req.token);
  res.status(204).send();
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`Auth Starter API listening on http://localhost:${port}`);
});
