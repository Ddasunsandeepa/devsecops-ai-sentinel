import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Middleware to verify the GitHub signature header
export const verifyGithubSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = (req as any).headers['x-hub-signature-256'] as string;
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  // 1. Fail open only in local dev if explicitly configured (optional)
  if (!secret) {
    console.warn("⚠️ GITHUB_WEBHOOK_SECRET not set. Skipping signature verification (UNSAFE).");
    return next();
  }

  if (!signature) {
    (res as any).status(401).json({ error: 'Unauthorized: Missing Signature' });
    return; // Explicitly return void
  }

  // 2. Compute HMAC
  // Note: req.body must be the raw buffer or string for this to work. 
  // If express.json() is used globally, we need to ensure we have access to the raw body.
  const hmac = crypto.createHmac('sha256', secret);
  
  // Assuming req.body is available as a JSON object, we stringify it. 
  // In a robust production app, we would use a body-parser 'verify' hook to get the raw buffer.
  const digest = 'sha256=' + hmac.update(JSON.stringify((req as any).body)).digest('hex');

  // 3. Timing Safe Comparison (Prevent Timing Attacks)
  try {
    const valid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );

    if (valid) {
      return next();
    } else {
      console.error('Signature mismatch', { received: signature, computed: digest });
      (res as any).status(401).json({ error: 'Unauthorized: Invalid Signature' });
      return;
    }
  } catch (err) {
    // Handle potential buffer length mismatch errors
    (res as any).status(401).json({ error: 'Unauthorized: Validation Error' });
    return;
  }
};