# Bookmarks API

A small Node.js + Express REST API for managing personal bookmarks. It keeps data in a local JSON file so the project can run without a database.

## Features

- List bookmarks
- Create bookmarks with title, URL, description, and tags
- Update or delete existing bookmarks
- Persist records to `data/bookmarks.json`
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
| GET | `/api/bookmarks` | List all bookmarks |
| GET | `/api/bookmarks/:id` | Get one bookmark |
| POST | `/api/bookmarks` | Create a bookmark |
| PATCH | `/api/bookmarks/:id` | Update a bookmark |
| DELETE | `/api/bookmarks/:id` | Delete a bookmark |

## Example payload

```json
{
  "title": "MDN Web Docs",
  "url": "https://developer.mozilla.org/",
  "description": "Reference docs for web developers",
  "tags": ["javascript", "docs"]
}
```
