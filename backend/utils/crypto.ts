import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
// In production, this must be a 32-byte hex string stored in ENV
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'); 

export const encrypt = (text: string) => {
  // IV must be unique per encryption
  const iv = crypto.randomBytes(16);
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();

  // Store IV and AuthTag alongside the encrypted data
  return {
    iv: iv.toString('hex'),
    content: encrypted,
    tag: authTag.toString('hex')
  };
};

export const decrypt = (encryptedData: { iv: string; content: string; tag: string }) => {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const authTag = Buffer.from(encryptedData.tag, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};
