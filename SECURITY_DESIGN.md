# Security Engineering Architecture & Threat Model

## 1. Vulnerability Detection Pipeline

The core of the Sentinel system relies on a multi-stage detection pipeline designed to minimize false negatives while managing false positives.

### A. Code Diff Extraction (Ingestion)
*   **Trigger:** GitHub Webhook (`push` or `pull_request`).
*   **Mechanism:** The backend fetches the `patch` data via GitHub API.
*   **Sanitization:** Large files (lockfiles, assets) and binary files are filtered out to reduce noise and token usage.

### B. Contextual AI Analysis (The Engine)
Instead of simple regex matching (like legacy tools), we use a Large Language Model (Gemini) acting as a Senior Security Engineer.

*   **Prompt Engineering:** We use a "Persona-based" prompt. The AI is instructed to adhere to **OWASP Top 10** and **CWE (Common Weakness Enumeration)** standards.
*   **Input:** The raw git diff + surrounding context (if available).
*   **Output:** Structured JSON containing:
    *   `cwe_id`: (e.g., CWE-89)
    *   `severity`: (CVSS v3.1 estimation)
    *   `confidence`: (Low/Medium/High)

### C. Risk Scoring
We calculate a proprietary "Commit Risk Score" (0-100):
`Score = (Critical * 25) + (High * 10) + (Medium * 5) + (Low * 1)`
*   **Thresholds:** If Score > 50, the pipeline marks the build as `UNSTABLE` (simulated).

---

## 2. Implemented Security Features

### 🔐 Cryptography & Secrets Management
*   **AES-256-GCM Encryption:** GitHub Access Tokens are *never* stored in plaintext. They are encrypted using `crypto.createCipheriv` with a unique IV per record.
*   **Key Management:** The Master Key is injected via `process.env.ENCRYPTION_KEY` and is never committed to code.

### 🛡️ Webhook Security
*   **HMAC SHA-256 Verification:** To prevent "Replay Attacks" or "Spoofing", every payload from GitHub is hashed using the `GITHUB_WEBHOOK_SECRET`. If the signature doesn't match `X-Hub-Signature-256`, the request is dropped immediately (401 Unauthorized).

### 🚦 Rate Limiting & DoS Protection
*   **Leaky Bucket Algorithm:** Implemented via `express-rate-limit`.
    *   *Webhooks:* 1000 req/hour (High throughput allowed for busy repos).
    *   *Auth Endpoints:* 10 req/minute (Brute force protection).

### 🔍 Supply Chain Security
*   **Dependency Scanning:** The CI/CD pipeline runs `Trivy` to detect CVEs in the Docker base images and npm dependencies before deployment.

---

## 3. Threat Model (STRIDE)

| Threat | Category | Mitigation Strategy |
| :--- | :--- | :--- |
| **Spoofing GitHub** | Spoofing | HMAC Signature Verification on all webhook endpoints. |
| **Token Theft from DB** | Information Disclosure | AES-256-GCM encryption for stored OAuth tokens. |
| **Prompt Injection** | Tampering | The AI System Prompt is sandboxed. We treat code input as "data" not instructions, though LLM risks remain (an inherent trade-off). |
| **DDoS on Webhook** | Denial of Service | Rate limiting and async processing (BullMQ) to offload heavy lifting from the API layer. |
| **Privilege Escalation** | Elevation of Privilege | Strict database roles. The Backend user cannot `DROP TABLE`. |

---

## 4. False Positive Handling

Security tools that cry "wolf" are ignored. We implement:

1.  **Confidence Thresholds:** The UI filters out findings with "Low" confidence by default.
2.  **Context Awareness:** The AI is prompted to ignore test files (`*.test.ts`, `tests/`) and comments.
3.  **Feedback Loop (Planned):** A "Mark as False Positive" button in the UI would retrain the prompt context for that specific repo.

---

## 5. Security Evaluation Criteria

If a Senior Security Engineer reviewed this code, they would look for:
1.  **No Hardcoded Secrets:** Checked via `gitleaks` in CI.
2.  **SQL Injection Prevention:** Usage of Parameterized Queries (`pg` client variables) everywhere.
3.  **Input Validation:** `Zod` schemas validating the shape of the webhook JSON before processing.
