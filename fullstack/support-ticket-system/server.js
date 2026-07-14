import express from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, 'data', 'tickets.json');
const publicDir = join(__dirname, 'public');
const priorities = ['low', 'medium', 'high'];
const statuses = ['open', 'in-progress', 'resolved'];
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '20kb' }));

async function readTickets() {
  return JSON.parse(await readFile(dataFile, 'utf8'));
}

async function saveTickets(tickets) {
  await writeFile(dataFile, `${JSON.stringify(tickets, null, 2)}\n`);
}

function clean(value) {
  return String(value ?? '').trim();
}

function requestBody(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function validateTicket(payload, partial = false) {
  const errors = [];

  if (!partial || payload.subject !== undefined) {
    const subject = clean(payload.subject);
    if (subject.length < 3 || subject.length > 100) {
      errors.push('subject must be between 3 and 100 characters');
    }
  }

  if (!partial || payload.requesterEmail !== undefined) {
    const email = clean(payload.requesterEmail).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('requesterEmail must be valid');
    }
  }

  if (!partial || payload.description !== undefined) {
    const description = clean(payload.description);
    if (description.length < 10 || description.length > 1000) {
      errors.push('description must be between 10 and 1000 characters');
    }
  }

  if (payload.priority !== undefined && !priorities.includes(clean(payload.priority).toLowerCase())) {
    errors.push(`priority must be one of: ${priorities.join(', ')}`);
  }

  if (payload.status !== undefined && !statuses.includes(clean(payload.status).toLowerCase())) {
    errors.push(`status must be one of: ${statuses.join(', ')}`);
  }

  return errors;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'support-ticket-system' });
});

app.get('/api/tickets', async (req, res, next) => {
  try {
    let tickets = await readTickets();
    const query = clean(req.query.q).toLowerCase();
    const status = clean(req.query.status).toLowerCase();
    const priority = clean(req.query.priority).toLowerCase();

    if (status && !statuses.includes(status)) {
      return res.status(400).json({ error: `Unknown status: ${status}` });
    }

    if (priority && !priorities.includes(priority)) {
      return res.status(400).json({ error: `Unknown priority: ${priority}` });
    }

    if (query) {
      tickets = tickets.filter((ticket) =>
        [ticket.subject, ticket.requesterEmail, ticket.description].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }

    if (status) tickets = tickets.filter((ticket) => ticket.status === status);
    if (priority) tickets = tickets.filter((ticket) => ticket.priority === priority);
    return res.json(tickets);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/tickets', async (req, res, next) => {
  try {
    const payload = requestBody(req.body);
    if (!payload) return res.status(400).json({ error: 'Request body must be a JSON object' });

    const errors = validateTicket(payload);
    if (errors.length > 0) return res.status(400).json({ errors });

    const now = new Date().toISOString();
    const ticket = {
      id: randomUUID(),
      subject: clean(payload.subject),
      requesterEmail: clean(payload.requesterEmail).toLowerCase(),
      description: clean(payload.description),
      priority: clean(payload.priority || 'medium').toLowerCase(),
      status: 'open',
      createdAt: now,
      updatedAt: now
    };

    const tickets = await readTickets();
    tickets.unshift(ticket);
    await saveTickets(tickets);
    return res.status(201).json(ticket);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/tickets/:id', async (req, res, next) => {
  try {
    const payload = requestBody(req.body);
    if (!payload) return res.status(400).json({ error: 'Request body must be a JSON object' });

    const allowedFields = ['subject', 'requesterEmail', 'description', 'priority', 'status'];
    const updates = Object.fromEntries(
      allowedFields.filter((field) => payload[field] !== undefined).map((field) => [field, payload[field]])
    );
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Provide at least one ticket field to update' });
    }

    const errors = validateTicket(updates, true);
    if (errors.length > 0) return res.status(400).json({ errors });

    const tickets = await readTickets();
    const index = tickets.findIndex((ticket) => ticket.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Ticket not found' });

    const current = tickets[index];
    tickets[index] = {
      ...current,
      ...(updates.subject === undefined ? {} : { subject: clean(updates.subject) }),
      ...(updates.requesterEmail === undefined
        ? {}
        : { requesterEmail: clean(updates.requesterEmail).toLowerCase() }),
      ...(updates.description === undefined ? {} : { description: clean(updates.description) }),
      ...(updates.priority === undefined
        ? {}
        : { priority: clean(updates.priority).toLowerCase() }),
      ...(updates.status === undefined ? {} : { status: clean(updates.status).toLowerCase() }),
      updatedAt: new Date().toISOString()
    };

    await saveTickets(tickets);
    return res.json(tickets[index]);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/tickets/:id', async (req, res, next) => {
  try {
    const tickets = await readTickets();
    const nextTickets = tickets.filter((ticket) => ticket.id !== req.params.id);
    if (nextTickets.length === tickets.length) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    await saveTickets(nextTickets);
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
  console.log(`Support Ticket System listening on http://localhost:${port}`);
});
