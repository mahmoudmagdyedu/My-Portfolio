# Inventory API

A small Node.js + Express REST API for tracking products, stock quantities, reorder levels, and prices. Data is stored in a local JSON file, so no database setup is required.

## Features

- List, search, and filter inventory items
- Create items with unique SKUs
- Update stock levels and product details
- Delete inventory items
- Persist records to `data/items.json`
- Basic health check endpoint

## Getting started

```bash
npm install
npm run dev
```

The server runs on `http://localhost:3000` by default.

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | API status |
| GET | `/api/items` | List inventory items |
| GET | `/api/items?q=keyboard` | Search by name or SKU |
| GET | `/api/items?lowStock=true` | List items at or below their reorder level |
| GET | `/api/items/:id` | Get one item |
| POST | `/api/items` | Create an item |
| PATCH | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |

## Example payload

```json
{
  "name": "USB-C Hub",
  "sku": "HUB-002",
  "quantity": 8,
  "reorderLevel": 3,
  "price": 29.99
}
```
