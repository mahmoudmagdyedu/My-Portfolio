# Auth Starter API

A small Node.js + Express REST API for user registration, login, bearer-token profile access, and logout. It stores users in a local JSON file so the project can run without a database.

## Features

- Register users with name, email, and password
- Hash passwords with Node.js `crypto.scrypt`
- Log in with email and password
- Protect profile routes with bearer tokens
- Log out by revoking the current token
- Persist users to `data/users.json`
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
| POST | `/api/auth/register` | Create a user account |
| POST | `/api/auth/login` | Create a bearer token |
| GET | `/api/auth/me` | Read the authenticated profile |
| DELETE | `/api/auth/logout` | Revoke the current bearer token |

## Example payloads

Register:

```json
{
  "name": "Mahmoud Magdy",
  "email": "mahmoud@example.com",
  "password": "secure-passphrase"
}
```

Login:

```json
{
  "email": "mahmoud@example.com",
  "password": "secure-passphrase"
}
```
