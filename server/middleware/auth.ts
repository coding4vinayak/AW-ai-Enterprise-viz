
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        customerId: string;
        email: string;
        username: string;
        role: string;
        status: string;
      };
      session: {
        userId?: string;
        destroy: (callback: (err: any) => void) => void;
        save: (callback: (err: any) => void) => void;
      };
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await storage.getUserById(userId);
    
    if (!user || user.status !== 'active') {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ error: 'Invalid session' });
    }

    req.user = {
      id: user.id,
      customerId: user.customerId || '',
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  
  if (userId) {
    storage.getUserById(userId).then(user => {
      if (user && user.status === 'active') {
        req.user = {
          id: user.id,
          customerId: user.customerId || '',
          email: user.email,
          username: user.username,
          role: user.role,
          status: user.status,
        };
      }
      next();
    }).catch(err => {
      console.error('Optional auth error:', err);
      next();
    });
  } else {
    next();
  }
}
