# Notes API

A small Node.js + Express REST API for managing personal notes. It stores records in a local JSON file so the project can run without a database.

## Features

- List notes
- Create notes with title, body, and tags
- Update note content or archive state
- Delete notes
- Persist records to `data/notes.json`
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
| GET | `/api/notes` | List all notes |
| GET | `/api/notes/:id` | Get one note |
| POST | `/api/notes` | Create a note |
| PATCH | `/api/notes/:id` | Update a note |
| DELETE | `/api/notes/:id` | Delete a note |

## Example payload

```json
{
  "title": "Sprint planning",
  "body": "Review backlog priorities and confirm delivery risks.",
  "tags": ["planning", "team"]
}
```
