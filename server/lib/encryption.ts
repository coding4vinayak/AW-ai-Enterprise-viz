
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Initialization vector length for AES-256-GCM
const AUTH_TAG_LENGTH = 16; // Authentication tag length for AES-256-GCM

// Get encryption key from environment, with validation
const getEncryptionKey = (): Buffer => {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (!envKey) {
    console.error('ENCRYPTION_KEY environment variable is not set. This is a security risk!');
    throw new Error('ENCRYPTION_KEY environment variable is required for security');
  }
  
  // Validate key length - should be 64 hex characters (32 bytes)
  if (envKey.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)');
  }
  
  // Validate it's a valid hex string
  if (!/^[0-9a-fA-F]{64}$/.test(envKey)) {
    throw new Error('ENCRYPTION_KEY must be a valid hexadecimal string');
  }
  
  return Buffer.from(envKey, 'hex');
};

export function encryptApiKey(text: string): string {
  if (!text) {
    throw new Error('Cannot encrypt empty or null text');
  }
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Return in format: base64(iv):base64(authTag):base64(encryptedData)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

export function decryptApiKey(encryptedText: string): string {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty or null encrypted text');
  }
  
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format: must contain exactly 3 parts separated by colons');
  }
  
  try {
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    
    // Validate buffer lengths
    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
    }
    
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`);
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API key - the data may be corrupted or the encryption key may have changed');
  }
}

// Function to generate a new encryption key (to be used during setup)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
