# Support Ticket System

A compact Node.js + Express help desk. It combines a REST API with a responsive browser dashboard and stores tickets in a local JSON file, so it runs without database setup.

## Features

- Submit support requests with a priority level
- Search by subject, requester, or description
- Filter tickets by status and priority
- Move tickets from open to resolved
- Delete tickets that are no longer needed
- Persist records in `data/tickets.json`
- Serve the dashboard and API from one Express app

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## API routes

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | Service status |
| GET | `/api/tickets` | List tickets |
| GET | `/api/tickets?q=export&status=open&priority=high` | Search and filter tickets |
| POST | `/api/tickets` | Create a ticket |
| PATCH | `/api/tickets/:id` | Update ticket details, priority, or status |
| DELETE | `/api/tickets/:id` | Delete a ticket |

## Example ticket

```json
{
  "subject": "Unable to export monthly report",
  "requesterEmail": "mona@example.com",
  "description": "CSV export stops after preparing the file.",
  "priority": "high"
}
```
