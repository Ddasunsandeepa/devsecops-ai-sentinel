/**
 * Backend Entry Point
 * Demonstrates: Express setup, Security Middleware, Routes
 */
import express, { Request, Response, NextFunction } from "express";
import "dotenv/config";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Queue } from "bullmq";
import { z } from "zod";
import { verifyGithubSignature } from "./middleware/webhook";
import { encrypt } from "./utils/crypto";

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// --- MIDDLEWARE ---
app.use(helmet() as any); // Security Headers
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }) as any);
app.use(express.json({ limit: "100kb" }) as any); // Body parser with limit

// Rate Limiting (DoS Protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter as any);

// --- QUEUE SETUP (DevOps/Async) ---
const scanQueue = new Queue("security-scans", {
  connection: {
    host: "redis",
    port: 6379,
  },
});

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
};

// --- VALIDATION SCHEMAS (Zod) ---
const GitHubPushSchema = z.object({
  ref: z.string(),
  repository: z.object({
    id: z.number(),
    url: z.string().url(),
    name: z.string(),
    full_name: z.string(), // ← ADD THIS
    html_url: z.string().url(), // ← ADD THIS
  }),
  head_commit: z.object({
    id: z.string(),
    message: z.string(),
    author: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  }),
});

app.get("/api/scans", async (req, res) => {
  const { rows } = await db.query(`
    SELECT 
      s.id,
      s.commit_id,
      s.status,
      s.risk_score,
      s.summary
    FROM scans s
    ORDER BY s.created_at DESC
    LIMIT 50
  `);
  res.json(rows);
});

app.post("/api/scan/:commitHash", async (req, res) => {
  const { commitHash } = req.params;

  await scanQueue.add("analyze-commit", { commitHash });

  res.json({ status: "queued" });
});

// --- ROUTES ---

// 1. Health Check (for K8s/Docker)
app.get("/health", (req, res) =>
  res.status(200).json({ status: "ok", uptime: (process as any).uptime() }),
);

app.get("/auth/github", (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = "http://localhost:3001/auth/github/callback";

  const url =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo read:user`;

  res.redirect(url);
});

// 2. Webhook Ingestion (The Entry Point)
// Added: Signature Verification Middleware
app.post("/webhooks/github", verifyGithubSignature, async (req, res) => {
  const event = req.headers["x-github-event"];

  if (event === "ping") {
    res.status(200).send("pong");
    return;
  }

  if (event === "push") {
    // Input Validation using Zod
    const validationResult = GitHubPushSchema.safeParse(req.body);

    if (!validationResult.success) {
      console.error("Invalid Payload:", validationResult.error);
      res.status(400).json({ error: "Invalid Payload Structure" });
      return;
    }

    const { ref, repository, head_commit } = validationResult.data;

    // Logic: Only scan main branch pushes for this demo
    if (ref === "refs/heads/main") {
      try {
        // A. Immediate Persistence
        // Note: In a real app, we would check if we have the User's access token to fetch the diff
        // 1. Ensure repo exists
        const repoResult = await db.query(
          `
  INSERT INTO repositories (github_repo_id, name, full_name, html_url)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (github_repo_id)
  DO UPDATE SET name = EXCLUDED.name
  RETURNING id
  `,
          [
            repository.id.toString(),
            repository.name,
            repository.full_name,
            repository.html_url,
          ],
        );

        const repoId = repoResult.rows[0].id;

        // 2. Insert commit
        await db.query(
          `
  INSERT INTO commits (repository_id, hash, message, author_name, author_email, timestamp)
  VALUES ($1, $2, $3, $4, $5, NOW())
  ON CONFLICT DO NOTHING
  `,
          [
            repoId,
            head_commit.id,
            head_commit.message,
            head_commit.author.name,
            head_commit.author.email,
          ],
        );

        // B. Async Processing
        await scanQueue.add("analyze-commit", {
          commitHash: head_commit.id,
          repoUrl: repository.url,
          pusher: head_commit.author.email,
        });

        res.status(202).json({ message: "Scan queued" });
        return;
      } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).json({ error: "Internal processing error" });
        return;
      }
    }
  }

  res.status(200).send("Ignored");
});

// 3. Mock Auth Route (Demonstrating Encryption)
app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;
  // Mock exchange code for token
  const mockAccessToken = "gho_SAMPLE_ACCESS_TOKEN_FROM_GITHUB";

  // Security: Encrypt token before DB storage
  const encryptedToken = encrypt(mockAccessToken);

  console.log("🔒 Secured Token for Storage:", encryptedToken);

  res.redirect(`${process.env.CLIENT_URL || "http://localhost"}/?auth=success`);
});

// 4. Dashboard Data API
app.get("/api/dashboard/stats", async (req, res) => {
  res.json({
    totalScans: 1284,
    averageRiskScore: 12,
    criticalVulnerabilities: 23,
    activeRepos: 5,
  });
});

// 5. Vulnerabilities API
app.get("/api/scans/:id", async (req, res) => {
  res.json({
    scanId: req.params.id,
    status: "COMPLETED",
    vulnerabilities: [],
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err.stack);
  (res as any).status(500).json({
    error: "Internal Server Error",
    requestId: (req as any).headers["x-request-id"],
  });
});

// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`🛡️ Sentinel Backend running on port ${PORT}`);
});

// Get connected repositories
app.get("/api/repos", async (req, res) => {
  const { rows } = await db.query(
    `SELECT DISTINCT repository_id FROM commits ORDER BY repository_id`,
    [],
  );
  res.json(rows.map((r) => ({ id: r.repository_id, name: r.repository_id })));
});

// Get commits for a repo
app.get("/api/repos/:repo/commits", async (req, res) => {
  const { repo } = req.params;
  const { rows } = await db.query(
    `SELECT * FROM commits WHERE repository_id = $1 ORDER BY id DESC LIMIT 20`,
    [repo],
  );
  res.json(rows);
});

// Dashboard stats
app.get("/api/dashboard", async (req, res) => {
  const scans = await db.query(`SELECT COUNT(*) FROM commits`, []);
  res.json({
    totalScans: scans.rows[0].count,
    activeRepos: 5,
    criticalVulnerabilities: 23,
    averageRiskScore: 12,
  });
});
