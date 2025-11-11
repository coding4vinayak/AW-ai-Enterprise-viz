
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { storage } from '../storage';
import { securityLogger, logger } from './logging';

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
        userRole?: string;
        customerId?: string;
        createdAt?: string;
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

    // Verify session integrity
    if (!req.session.createdAt) {
      // Add creation timestamp to prevent session fixation
      req.session.createdAt = new Date().toISOString();
    }

    const user = await storage.getUserById(userId);
    
    if (!user || user.status !== 'active') {
      // Log security event
      logger.warn({
        type: 'security-event',
        event: 'invalid_session_access',
        userId,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }, 'Invalid session access attempt');
      
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Verify customer exists for multi-tenancy
    if (user.customerId) {
      const customer = await storage.getCustomer(user.customerId);
      if (!customer || customer.status !== 'active') {
        logger.warn({
          type: 'security-event',
          event: 'inactive_customer_access',
          userId: user.id,
          customerId: user.customerId,
          ip: req.ip || req.connection.remoteAddress
        }, 'User tried to access inactive customer');
        
        req.session.destroy((err) => {
          if (err) console.error('Session destroy error:', err);
        });
        return res.status(401).json({ error: 'Invalid customer account' });
      }
    }

    // Update session with additional security info
    req.session.userRole = user.role;
    req.session.customerId = user.customerId;

    req.user = {
      id: user.id,
      customerId: user.customerId || '',
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
    };

    // Log successful authentication for this request
    logger.info({
      type: 'auth-event',
      event: 'request-authenticated',
      userId: user.id,
      customerId: user.customerId,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    }, 'Request authenticated successfully');

    next();
  } catch (error) {
    logger.error({
      type: 'auth-error',
      error: error instanceof Error ? error.message : String(error),
      userId: req.session?.userId,
      ip: req.ip || req.connection.remoteAddress
    }, 'Authentication error');
    
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.userId;
  
  if (userId) {
    storage.getUserById(userId).then(user => {
      if (user && user.status === 'active') {
        // Verify customer exists for multi-tenancy
        if (user.customerId) {
          storage.getCustomer(user.customerId).then(customer => {
            if (customer && customer.status === 'active') {
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
            console.error('Customer check error:', err);
            next();
          });
        } else {
          req.user = {
            id: user.id,
            customerId: user.customerId || '',
            email: user.email,
            username: user.username,
            role: user.role,
            status: user.status,
          };
          next();
        }
      } else {
        next();
      }
    }).catch(err => {
      console.error('Optional auth error:', err);
      next();
    });
  } else {
    next();
  }
}

// Additional security middleware to verify session consistency
export function sessionSecurity(req: Request, res: Response, next: NextFunction) {
  // Check for potential session tampering
  if (req.session.userId && req.user && req.session.userRole) {
    if (req.user.id !== req.session.userId || 
        req.user.role !== req.session.userRole ||
        req.user.customerId !== req.session.customerId) {
      logger.warn({
        type: 'security-event',
        event: 'session_data_mismatch',
        sessionUserId: req.session.userId,
        sessionRole: req.session.userRole,
        sessionCustomerId: req.session.customerId,
        actualUserId: req.user?.id,
        actualRole: req.user?.role,
        actualCustomerId: req.user?.customerId,
        ip: req.ip || req.connection.remoteAddress
      }, 'Session data mismatch detected');
      
      req.session.destroy((err) => {
        if (err) {
          logger.error({ error: err }, 'Error destroying tampered session');
        }
      });
      
      return res.status(401).json({ error: 'Session data mismatch' });
    }
  }
  
  next();
}
