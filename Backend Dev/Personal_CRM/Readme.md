# Personal CRM

A simple, extendable Customer Relationship Management (CRM) backend built with Node.js, Express, Prisma and PostgreSQL.  
Provides user authentication (email/password + OAuth), session management, rate-limiting, and full CRUD on users, contacts, notes, interactions and tags.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Database Setup & Migrations](#database-setup--migrations)  
- [Running the App](#running-the-app)  
- [API Endpoints](#api-endpoints)  
- [License](#license)  

---

## Features

- User registration, email verification, login/logout, password reset  
- OAuth 2.0 via Google & GitHub  
- JWT-based authentication & refresh tokens  
- Rate limiting, security headers with Helmet, request logging with Morgan  
- Full CRUD on:
  - **Contacts**: add, update, delete, search, bulk delete, CSV export  
  - **Notes**: attach free-text notes to contacts  
  - **Interactions**: log, list, filter, update, delete  
  - **Tags**: assign or remove tags to/from contacts, usage count  
- Input validation with express-validator  
- Centralized error handling  

---

## Tech Stack

- Node.js & Express  
- PostgreSQL  
- Prisma ORM  
- JWT for auth, express-session for OAuth  
- Docker & docker-compose (optional)  

---

## Prerequisites

- Node >= 18  
- npm  
- PostgreSQL database  
- (Optional) Docker & Docker Compose  

---

## Installation

1. Clone the repo  
   ```bash
   git clone https://github.com/your-username/personal_crm.git
   cd personal_crm
   ```
2. Install dependencies  
   ```bash
   npm install
   ```
3. Copy `.env.example` → `.env` and fill in your credentials  

---

## Environment Variables

Create `.env` and set:

```
PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB_NAME?schema=public"

SESSION_SECRET=your_session_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

EMAIL=your@gmail.com
APP_PASSWORD=your_gmail_app_password

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
BASE_URL=http://localhost:3000
```

---

## Database Setup & Migrations

Make sure `DATABASE_URL` in `.env` points to your Postgres instance.

1. Generate Prisma client  
   ```bash
   npx prisma generate
   ```
2. Apply migrations  
   ```bash
   npx prisma migrate deploy
   ```
3. (Optional) To create or reset locally:  
   ```bash
   npx prisma migrate reset
   ```

---

## Running the App

### Development

```bash
npm run dev
```

Server will listen on `http://localhost:${PORT}`.

### Docker

```bash
docker-compose up --build
```

---

## API Endpoints

Base URL: `http://localhost:${PORT}/api/v1`

### Health

- `GET /health` — service status  

### Auth

- `POST /auth/google` & `/auth/github` — OAuth flows  
- `GET /auth/google/callback` & `/auth/github/callback`  

### User

- `POST /user/register`  
- `POST /user/reVerify-email`  
- `GET  /user/verify-email`  
- `POST /user/login`  
- `POST /user/logOut`  
- `PATCH /user/updatePassword`  
- `POST /user/forgotPassword`  
- `POST /user/resetPassword`  
- `POST /user/renewToken`  
- `PATCH /user/updateDetails`  
- `PATCH /user/status`  

### Contacts

- `POST   /contacts/add-contact`  
- `GET    /contacts/get-contact-by-id`  
- `PATCH  /contacts/update-contact`  
- `DELETE /contacts/delete-contact`  
- `DELETE /contacts/delete-multiple-contacts`  
- `GET    /contacts/export-contacts`  

### Tags

- `POST   /contacts/add-tag`  
- `POST   /contacts/add-multiple-tags`  
- `DELETE /contacts/delete-tag-from-contact`  
- `DELETE /contacts/delete-multiple-tags-from-contacts`  
- `GET    /contacts/get-tag-usage/:tagName`  
- `DELETE /contacts/delete-tag`  

### Notes

- `POST   /notes/create-note`  
- `GET    /notes/list-notes`  
- `GET    /notes/get-note`  
- `PATCH  /notes/update-note`  
- `DELETE /notes/delete-note`  

### Interactions

- `POST   /interactions/log-interaction`  
- `GET    /interactions/list-interactions`  
- `GET    /interactions/get-interaction`  
- `PATCH  /interactions/update-interaction`  
- `DELETE /interactions/delete-interaction`  

---

## License

ISC © Mohd Moshahid Raza  