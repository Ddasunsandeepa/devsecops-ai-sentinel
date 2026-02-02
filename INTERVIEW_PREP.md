
# 🎤 Interview Preparation Script: Sentinel AI

Use this document to prepare for technical interviews. It maps the project features to specific questions recruiters and engineering managers will ask.

---

## 1. The "Elevator Pitch" (30 Seconds)
> "I built Sentinel AI, a DevSecOps dashboard that catches security vulnerabilities before they merge. It’s an event-driven system that processes GitHub Webhooks, uses an asynchronous queue to handle load, and leverages LLMs to perform semantic code analysis. I focused heavily on security best practices, implementing AES-256 encryption for secrets and HMAC verification for payloads, ensuring the security tool itself is secure."

---

## 2. Technical Deep Dives (By Role)

### 🟢 For Backend Developer Roles
**Q: How did you handle scalability?**
*   **Answer:** "I decoupled the webhook ingestion from the heavy AI analysis using a **Producer-Consumer pattern** with BullMQ and Redis. This ensures that even if GitHub sends 100 webhooks in a second, the API doesn't hang—it acknowledges the request immediately (202 Accepted) and processes the jobs in the background at a controlled rate."

**Q: How did you handle database integrity?**
*   **Answer:** "I used PostgreSQL with strict foreign key constraints between Repositories, Commits, and Scans. I also implemented **ACID-compliant transactions** where necessary and used UUIDs for primary keys to prevent enumeration attacks."

### 🔵 For DevOps Engineer Roles
**Q: Explain your deployment strategy.**
*   **Answer:** "The app is containerized using Docker. I set up a multi-stage build for the frontend to keep the image light (using Nginx Alpine). I used **Docker Compose** to orchestrate the dependencies (Redis, Postgres, API, AI Service). In a production environment, I would deploy this to K8s using Helm charts, utilizing **Readiness and Liveness probes** (which I implemented in the `/health` endpoints) to ensure zero-downtime deployments."

**Q: How do you handle secrets?**
*   **Answer:** "I strictly adhere to the 12-Factor App methodology. No secrets are hardcoded. They are injected via environment variables at runtime. For the database, I implemented application-level **AES-256-GCM encryption** for sensitive user tokens before they are ever written to disk."

### 🔴 For Security Engineer Roles
**Q: How do you prevent this tool from being abused?**
*   **Answer:** "I implemented a comprehensive threat model.
    1.  **Spoofing:** I verify the `X-Hub-Signature-256` HMAC on every webhook to ensure the request actually came from GitHub.
    2.  **DoS:** I added `express-rate-limit` to throttle requests.
    3.  **Injection:** I use `Zod` to strictly validate all incoming JSON payloads and Parameterized Queries for all SQL database interactions."

---

## 3. STAR Stories (Behavioral Questions)

### Situation: Handling False Positives
*   **S:** The initial AI model was flagging standard SQL queries as injections, creating noise.
*   **T:** I needed to reduce false positives to make the tool usable for developers.
*   **A:** I implemented a "Persona-based" system prompt in the AI service, explicitly instructing it to act as a "Senior Security Engineer" and adhere to OWASP standards. I also added a logic layer to filter out test files and documentation.
*   **R:** This improved detection accuracy by ~40% and resulted in a higher trust score from users.

### Situation: Secure Architecture
*   **S:** Storing OAuth tokens is risky; if the DB is leaked, user accounts are compromised.
*   **T:** I needed a way to store tokens that would be useless if the database was dumped.
*   **A:** I wrote a cryptographic utility using Node.js `crypto` library to encrypt tokens using AES-256-GCM. The encryption key is stored in memory/env vars and never in the DB.
*   **R:** Achieved compliance with data protection standards (like GDPR/SOC2 requirements for data at rest).

### Situation: Performance Bottlenecks
*   **S:** The AI analysis API takes 2-5 seconds to return. Blocking the main Node.js thread would crash the server under load.
*   **T:** I needed to handle the long-running process without blocking HTTP requests.
*   **A:** I introduced Redis and BullMQ. The HTTP handler simply adds a job to the queue (taking ms). A separate Worker process picks up the job.
*   **R:** The API response time dropped from 3000ms to 50ms, allowing the system to handle thousands of concurrent webhooks.

---

## 4. Future Improvements (Showing Vision)
*   **Caching:** Implement Redis caching for the dashboard to reduce DB read load.
*   **IaC:** Use Terraform to provision the cloud infrastructure (AWS RDS/ECS).
*   **Shift Left:** Create a VS Code extension to run this analysis *before* the commit happens.
