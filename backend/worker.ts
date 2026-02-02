/**
 * Worker Service
 * Demonstrates: Async processing, AI integration, Retry logic
 */
import "dotenv/config";
import express from "express";
import { Worker } from "bullmq";
import { analyzeCodeWithGemini } from "../services/geminiService"; // Reusing service logic logic conceptually
// In a real monorepo, services would be shared. Here we mock the AI import for the backend file.

const REDIS_URL = process.env.REDIS_URL!;

console.log("🚀 Starting Worker Service...");

const worker = new Worker(
  "security-scans",
  async (job) => {
    console.log(`[Job ${job.id}] Processing commit: ${job.data.commitHash}`);

    try {
      // Step 1: Fetch Code Diff from GitHub (Mocked)
      // const diff = await githubApi.getCommitDiff(job.data.repoUrl, job.data.commitHash);
      const mockDiff = `
      + function login(user, pass) {
      +   // TODO: Remove before prod
      +   console.log("Login attempt:", user, pass); 
      + }
    `;

      // Step 2: AI Analysis
      // Note: We use the logic defined in our frontend service, but executed in Node context
      // const result = await analyzeCodeWithGemini(mockDiff);

      // Simulating AI delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const riskScore = 85; // High risk due to console.log of credentials

      // Step 3: Update Database
      console.log(
        `[Job ${job.id}] Analysis complete. Risk Score: ${riskScore}`,
      );

      // await db.query('UPDATE scans SET status=$1, risk_score=$2 ...', ['COMPLETED', riskScore]);

      return { status: "success", riskScore };
    } catch (error) {
      console.error(`[Job ${job.id}] Failed:`, error);
      throw error; // Triggers BullMQ retry logic
    }
  },
  {
    connection: {
      host: "redis",
      port: 6379,
    },
    concurrency: 5, // Process 5 scans in parallel
    limiter: {
      max: 10, // Max 10 jobs
      duration: 1000, // per second (Rate limit for external AI API)
    },
  },
);

worker.on("completed", (job) => {
  console.log(`[Job ${job.id}] Completed successfully`);
});

worker.on("failed", (job, err) => {
  console.log(`[Job ${job?.id}] Failed with ${err.message}`);
});
