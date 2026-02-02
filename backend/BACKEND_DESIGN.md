# DevSecOps AI Sentinel - Backend Design Document

## 1. System Overview

The backend is a Node.js/Express application acting as the orchestrator between GitHub Webhooks, the AI Analysis Engine, and the Frontend Dashboard. It utilizes an asynchronous event-driven architecture to handle high-volume webhook events without blocking.

### Core Tech Stack
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js
- **Database:** PostgreSQL 16
- **Queue System:** BullMQ (Redis)
- **AI Integration:** Google GenAI SDK

---

## 2. Authentication & Security

### Authentication Flow (OAuth 2.0)
1. **Frontend** redirects user to `/auth/github`.
2. **Backend** redirects to GitHub Authorization URL.
3. **GitHub** callbacks to `/auth/github/callback` with `code`.
4. **Backend** exchanges `code` for `access_token`.
5. **Backend** encrypts `access_token` (AES-256) and upserts User in DB.
6. **Backend** issues a `httpOnly` JWT cookie and redirects to Dashboard.

### Security Practices
- **Helmet.js:** Sets secure HTTP headers (HSTS, X-Frame-Options).
- **Rate Limiting:** 100 req/15min for general APIs; 10 req/min for Auth.
- **Input Validation:** Zod schemas for all request bodies.
- **Webhook Signature Verification:** HMAC SHA-256 validation of `X-Hub-Signature-256`.
- **Least Privilege:** Database user only has CRUD permissions on specific tables.

---

## 3. Asynchronous Processing (The "DevOps" Component)

To ensure scalability, the commit analysis is decoupled from the webhook ingestion.

1. **Producer (Webhook Endpoint):** 
   - Receives payload.
   - Verifies Signature.
   - Saves `Commit` metadata to DB (Status: `QUEUED`).
   - Adds Job `analyze_commit` to Redis Queue.
   - Responds `202 Accepted` immediately.

2. **Consumer (Worker Service):**
   - Polls Redis Queue.
   - Fetches full file diffs from GitHub API using User's stored token.
   - Sends diffs to AI Service.
   - Parses JSON response.
   - Updates `Scans` and `Vulnerabilities` tables.
   - (Optional) Posts comment back to GitHub PR.

---

## 4. API Specification

### Auth
- `GET /auth/github`: Initiate OAuth.
- `GET /auth/github/callback`: Handle callback.
- `GET /auth/logout`: Clear session.
- `GET /auth/me`: Get current user context.

### Repositories
- `GET /repos`: List monitored repositories.
- `POST /repos`: Add a repository to monitor (installs webhook).
- `DELETE /repos/:id`: Stop monitoring.

### Webhooks
- `POST /webhooks/github`: Endpoint for GitHub to push events (push, pull_request).

### Dashboard & Data
- `GET /dashboard/stats`: Aggregated metrics (Total Scans, MTTR, Risk Score).
- `GET /commits`: Paginated list of recent commits.
- `GET /commits/:hash/scan`: Get detailed scan result and vulnerabilities.

---

## 5. Error Handling Strategy

1. **Operational Errors (4xx):** Validation fails, Auth fails. Returned immediately to client with clear JSON code.
2. **Programmer Errors (5xx):** Uncaught exceptions. Caught by Global Error Handler, logged to observability (e.g., Datadog/Sentry), generic message returned to client.
3. **Async Errors:** Failed Jobs in BullMQ are retried 3 times with exponential backoff. After max retries, moved to `Dead Letter Queue` for manual inspection.

