# URL Shortener API

A small Node.js + Express API for creating short links and redirecting visitors to their destination. Data is stored in a local JSON file, so no database is required.

## Getting started

```bash
npm install
npm run dev
```

The server runs at `http://localhost:3000` by default.

## Endpoints

| Method | Route | Description |
| --- | --- | --- |
| GET | `/health` | API status |
| GET | `/api/links` | List short links |
| POST | `/api/links` | Create a short link |
| GET | `/s/:code` | Redirect and count a click |

## Example payload

```json
{
  "url": "https://example.com/article",
  "code": "article"
}
```
