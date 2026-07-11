import express from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, 'data', 'items.json');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

async function readItems() {
  const contents = await readFile(dataFile, 'utf8');
  return JSON.parse(contents);
}

async function saveItems(items) {
  await writeFile(dataFile, `${JSON.stringify(items, null, 2)}\n`);
}

function normalizeSku(value) {
  return String(value).trim().toUpperCase();
}

function isNonNegativeInteger(value) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function requestBody(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value;
}

function validateItem(payload, partial = false) {
  const errors = [];

  if (!partial || payload.name !== undefined) {
    if (!payload.name || String(payload.name).trim().length < 2) {
      errors.push('name must be at least 2 characters');
    }
  }

  if (!partial || payload.sku !== undefined) {
    if (!payload.sku || normalizeSku(payload.sku).length < 3) {
      errors.push('sku must be at least 3 characters');
    }
  }

  if (payload.quantity !== undefined && !isNonNegativeInteger(payload.quantity)) {
    errors.push('quantity must be a non-negative integer');
  }

  if (payload.reorderLevel !== undefined && !isNonNegativeInteger(payload.reorderLevel)) {
    errors.push('reorderLevel must be a non-negative integer');
  }

  if (payload.price !== undefined && !isNonNegativeNumber(payload.price)) {
    errors.push('price must be a non-negative number');
  }

  return errors;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inventory-api' });
});

app.get('/api/items', async (req, res, next) => {
  try {
    let items = await readItems();
    const query = String(req.query.q || '').trim().toLowerCase();

    if (query) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query)
      );
    }

    if (req.query.lowStock === 'true') {
      items = items.filter((item) => item.quantity <= item.reorderLevel);
    }

    res.json(items);
  } catch (error) {
    next(error);
  }
});

app.get('/api/items/:id', async (req, res, next) => {
  try {
    const items = await readItems();
    const item = items.find((entry) => entry.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

app.post('/api/items', async (req, res, next) => {
  try {
    const payload = requestBody(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const errors = validateItem(payload);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const items = await readItems();
    const sku = normalizeSku(payload.sku);
    if (items.some((item) => item.sku === sku)) {
      return res.status(409).json({ error: 'SKU already exists' });
    }

    const now = new Date().toISOString();
    const item = {
      id: randomUUID(),
      name: String(payload.name).trim(),
      sku,
      quantity: payload.quantity ?? 0,
      reorderLevel: payload.reorderLevel ?? 5,
      price: payload.price ?? 0,
      createdAt: now,
      updatedAt: now
    };

    items.unshift(item);
    await saveItems(items);

    return res.status(201).json(item);
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/items/:id', async (req, res, next) => {
  try {
    const payload = requestBody(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'Request body must be a JSON object' });
    }

    const errors = validateItem(payload, true);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const items = await readItems();
    const index = items.findIndex((item) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const current = items[index];
    const nextSku = payload.sku === undefined ? current.sku : normalizeSku(payload.sku);
    if (items.some((item, itemIndex) => itemIndex !== index && item.sku === nextSku)) {
      return res.status(409).json({ error: 'SKU already exists' });
    }

    const updated = {
      ...current,
      name: payload.name === undefined ? current.name : String(payload.name).trim(),
      sku: nextSku,
      quantity: payload.quantity === undefined ? current.quantity : payload.quantity,
      reorderLevel:
        payload.reorderLevel === undefined
          ? current.reorderLevel
          : payload.reorderLevel,
      price: payload.price === undefined ? current.price : payload.price,
      updatedAt: new Date().toISOString()
    };

    items[index] = updated;
    await saveItems(items);

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/items/:id', async (req, res, next) => {
  try {
    const items = await readItems();
    const nextItems = items.filter((item) => item.id !== req.params.id);

    if (nextItems.length === items.length) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await saveItems(nextItems);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  const status = Number(error.status || error.statusCode);
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    return res.status(status).json({ error: 'Invalid request' });
  }

  console.error(error);
  return res.status(500).json({ error: 'Unexpected server error' });
});

app.listen(port, () => {
  console.log(`Inventory API listening on http://localhost:${port}`);
});
