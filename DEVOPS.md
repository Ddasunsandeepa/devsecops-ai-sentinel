# DevOps & Infrastructure Guide

This document outlines the deployment strategy, environment configuration, and production readiness checklist for **DevSecOps AI Sentinel**.

## 1. Deployment Strategy

We utilize a **Containerized Microservices** approach. The application is split into Docker containers managed via `docker-compose` for local development and can be deployed to any container orchestration platform (K8s, ECS, Render).

### Option A: Free Tier Deployment (Recommended for Portfolio)
**Platform:** [Render.com](https://render.com) or [Railway.app](https://railway.app)

1. **Backend:** Deploy as a "Web Service" using the `./backend` Dockerfile.
2. **AI Service:** Deploy as a "Private Service" using the `./ai-service` Dockerfile.
3. **Frontend:** Deploy as a "Static Site" or "Web Service" (using the Nginx Dockerfile).
4. **Database:** Provision a managed PostgreSQL instance (available on Render/Railway free tiers).
5. **Redis:** Provision a managed Redis instance.

### Option B: AWS Enterprise Deployment
**Stack:** EC2 (App) + RDS (Postgres) + ElastiCache (Redis)

1. Push images to **ECR**.
2. Deploy `docker-compose.yml` to an **EC2** instance (or use ECS Fargate for serverless containers).
3. Use **RDS** for persistence and **ElastiCache** for the job queue.
4. Put **ALB (Application Load Balancer)** in front of the Frontend/Backend.

## 2. Environment Variables

| Variable | Description | Service |
|----------|-------------|---------|
| `PORT` | Service port (default 3001) | Backend |
| `DATABASE_URL` | PostgreSQL connection string | Backend |
| `REDIS_URL` | Redis connection string | Backend |
| `API_KEY` | Google Gemini API Key | Backend, AI Service |
| `GITHUB_CLIENT_ID` | OAuth Client ID | Backend |
| `GITHUB_CLIENT_SECRET` | OAuth Client Secret | Backend |
| `AI_SERVICE_URL` | Internal URL for AI microservice | Backend |

## 3. Logging & Monitoring

### Logging strategy
- **Format:** All services output structured JSON logs to `stdout`/`stderr`.
- **Aggregation:** In production, a log collector (like Fluentd) ships logs to ElasticSearch or Datadog.
- **Correlation:** A unique `requestId` is generated at the ingress (Backend) and passed to downstream services (AI Service) to trace requests across containers.

### Monitoring
- **Health Checks:** Implemented in `docker-compose` and K8s probes.
- **Metrics:** `GET /health` endpoint provides uptime. Critical metrics (Queue Depth, API Latency) should be tracked.

## 4. Production Readiness Checklist

- [ ] **Security:** API Keys are rotated and stored in Secrets Manager (not code).
- [ ] **Security:** Database is in a private subnet, not accessible publicly.
- [ ] **Performance:** Database indexes are applied (see `schema.sql`).
- [ ] **Scalability:** The Worker service can be scaled horizontally (multiple replicas) to handle high webhook volume.
- [ ] **Resilience:** Retry logic is configured for external API calls (Gemini/GitHub).
- [ ] **CI/CD:** Pipeline passes Linting, Testing, and Vulnerability Scanning (Trivy) before merge.

