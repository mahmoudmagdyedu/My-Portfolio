import express from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, 'data', 'contacts.json');
const publicDir = join(__dirname, 'public');
const stages = ['lead', 'qualified', 'proposal', 'customer'];
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '20kb' }));

async function readContacts() {
  return JSON.parse(await readFile(dataFile, 'utf8'));
}

async function saveContacts(contacts) {
  await writeFile(dataFile, `${JSON.stringify(contacts, null, 2)}\n`);
}

function clean(value) {
  return String(value ?? '').trim();
}

function requestBody(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function validateContact(payload, partial = false) {
  const errors = [];

  if (!partial || payload.name !== undefined) {
    if (clean(payload.name).length < 2) errors.push('name must be at least 2 characters');
  }

  if (!partial || payload.email !== undefined) {
    const email = clean(payload.email).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email must be valid');
  }

  if (!partial || payload.company !== undefined) {
    if (clean(payload.company).length < 2) errors.push('company must be at least 2 characters');
  }

  if (payload.stage !== undefined && !stages.includes(clean(payload.stage).toLowerCase())) {
    errors.push(`stage must be one of: ${stages.join(', ')}`);
  }

  if (payload.notes !== undefined && clean(payload.notes).length > 500) {
    errors.push('notes must be 500 characters or fewer');
  }

  return errors;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mini-crm' });
});

app.get('/api/contacts', async (req, res, next) => {
  try {
    let contacts = await readContacts();
    const query = clean(req.query.q).toLowerCase();
    const stage = clean(req.query.stage).toLowerCase();

    if (stage && !stages.includes(stage)) {
      return res.status(400).json({ error: `Unknown stage: ${stage}` });
    }

    if (query) {
      contacts = contacts.filter((contact) =>
        [contact.name, contact.email, contact.company].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }

    if (stage) contacts = contacts.filter((contact) => contact.stage === stage);
    return res.json(contacts);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/contacts', async (req, res, next) => {
  try {
    const payload = requestBody(req.body);
    if (!payload) return res.status(400).json({ error: 'Request body must be a JSON object' });

    const errors = validateContact(payload);
    if (errors.length > 0) return res.status(400).json({ errors });

    const contacts = await readContacts();
    const email = clean(payload.email).toLowerCase();
    if (contacts.some((contact) => contact.email === email)) {
      return res.status(409).json({ error: 'A contact with this email already exists' });
    }

    const now = new Date().toISOString();
    const contact = {
      id: randomUUID(),
      name: clean(payload.name),
      email,
      company: clean(payload.company),
      stage: clean(payload.stage || 'lead').toLowerCase(),
      notes: clean(payload.notes),
      createdAt: now,
      updatedAt: now
    };

    contacts.unshift(contact);
    await saveContacts(contacts);
    return res.status(201).json(contact);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/contacts/:id', async (req, res, next) => {
  try {
    const payload = requestBody(req.body);
    if (!payload) return res.status(400).json({ error: 'Request body must be a JSON object' });

    const allowedFields = ['name', 'email', 'company', 'stage', 'notes'];
    const updates = Object.fromEntries(
      allowedFields.filter((field) => payload[field] !== undefined).map((field) => [field, payload[field]])
    );
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Provide at least one contact field to update' });
    }

    const errors = validateContact(updates, true);
    if (errors.length > 0) return res.status(400).json({ errors });

    const contacts = await readContacts();
    const index = contacts.findIndex((contact) => contact.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Contact not found' });

    const current = contacts[index];
    const email = updates.email === undefined ? current.email : clean(updates.email).toLowerCase();
    if (contacts.some((contact, contactIndex) => contactIndex !== index && contact.email === email)) {
      return res.status(409).json({ error: 'A contact with this email already exists' });
    }

    contacts[index] = {
      ...current,
      ...(updates.name === undefined ? {} : { name: clean(updates.name) }),
      ...(updates.company === undefined ? {} : { company: clean(updates.company) }),
      ...(updates.stage === undefined ? {} : { stage: clean(updates.stage).toLowerCase() }),
      ...(updates.notes === undefined ? {} : { notes: clean(updates.notes) }),
      email,
      updatedAt: new Date().toISOString()
    };

    await saveContacts(contacts);
    return res.json(contacts[index]);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/contacts/:id', async (req, res, next) => {
  try {
    const contacts = await readContacts();
    const nextContacts = contacts.filter((contact) => contact.id !== req.params.id);
    if (nextContacts.length === contacts.length) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await saveContacts(nextContacts);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use(express.static(publicDir));

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`Mini CRM listening on http://localhost:${port}`);
});
