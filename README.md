# Personal CRM

A simple, extendable Customer Relationship Management (CRM) backend built with Node.js, Express, Prisma and PostgreSQL.  
Provides user authentication (email/password + OAuth), session management, rate-limiting, and full CRUD on users, contacts, notes, interactions and tags.

---

## Table of Contents

- [Key Features](#features)  
- [Tech Stack](#tech-stack)  
- [Architechture](#architecture)
- [System Components](#system-components)
- [System Architecture Overview](#system-architecture-overview)
- [Performance](#performance)
- [Rate Limiting](#rate-limiting)
- [Database Optimization](#database-optimization)
- [Monitoring](#monitoring)
- [Health Checks](#health-checks)
- [Logging](#logging)
- [Security](#security)
- [Authentication Flow](#authentication-flow)
- [Data Protection](#data-protection)
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Database Setup & Migrations](#database-setup--migrations)  
- [Running the App](#running-the-app)  
- [API Endpoints](#api-endpoints)  
- [License](#license)  

---

### Key Features
  
- **Contact Management**: Full CRUD with custom fields, tags, and relationships
- **Interaction Tracking**: Log and analyze customer touchpoints
- **Analytics Dashboard**: Insights on contact engagement and trends
- **Subscription Management**: Freemium model with Stripe integration
- **Security**: Rate limiting, input validation, OAuth protection  

---

## Tech Stack

- Node.js & Express  
- PostgreSQL  
- Prisma ORM  
- JWT for auth, express-session for OAuth  
- Docker & docker-compose (optional)  

---

## Architecture

### System Components
- **API Server**: Express.js with rate limiting and security middleware
- **Database**: PostgreSQL with Prisma ORM
- **RateLimit**: Redis for rate limiting
- **Payments**: Stripe integration for subscription management
- **Authentication**: JWT + OAuth 2.0 (Google, GitHub)



### System Architecture Overview

![alt text](src/assets/image.png)

## Performance

### Rate Limiting
- Sliding window algorithm with Redis backend
- 100 requests per 15 minutes per IP/user
- Graceful degradation on Redis failure

### Database Optimization
- Indexed queries for user-specific data
- Efficient pagination and search
- Cascading deletes for data consistency

## Monitoring

### Health Checks
- `GET /api/v1/health` - Service status
- `GET /api/v1/ready` - Database connectivity

### Logging
- Request/response logging with Morgan
- Error tracking and stack traces
- Rate limiting statistics

## Security

### Authentication Flow
1. User registration with email verification
2. JWT token generation (15min access + 7d refresh)
3. OAuth 2.0 integration with CSRF protection
4. Session management for OAuth flows

### Data Protection
- Password hashing with bcrypt
- Input sanitization and validation
- SQL injection prevention via Prisma
- XSS protection with Helmet


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

NODE_ENV=production
REDIS_URL=redis://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
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