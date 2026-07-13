# Mini CRM

A compact Node.js + Express customer relationship manager. It combines a small REST API with a responsive browser dashboard and stores contacts in a local JSON file, so it runs without database setup.

## Features

- Add and remove customer contacts
- Search by name, email, or company
- Filter contacts by pipeline stage
- Move contacts from lead to customer
- Persist records in `data/contacts.json`
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
| GET | `/api/contacts` | List contacts |
| GET | `/api/contacts?q=amina&stage=proposal` | Search and filter contacts |
| POST | `/api/contacts` | Add a contact |
| PATCH | `/api/contacts/:id` | Update contact details or stage |
| DELETE | `/api/contacts/:id` | Delete a contact |

## Example contact

```json
{
  "name": "Sara Ali",
  "email": "sara@example.com",
  "company": "Brightline Labs",
  "stage": "lead",
  "notes": "Requested a product demo."
}
```
