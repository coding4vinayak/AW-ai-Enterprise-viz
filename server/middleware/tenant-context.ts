
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      customerId: string;
    }
  }
}

export function injectTenantContext(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.customerId) {
    return res.status(403).json({ error: 'No tenant context available' });
  }
  
  req.customerId = req.user.customerId;
  next();
}

export function validateTenantAccess(req: Request, res: Response, next: NextFunction) {
  const { customerId } = req.params;
  
  if (!customerId) {
    return next();
  }

  // Super admin can access any tenant
  if (req.user?.role === 'super_admin') {
    return next();
  }

  // Regular users can only access their own tenant
  if (customerId !== req.customerId) {
    return res.status(403).json({ error: 'Access denied to this tenant' });
  }

  next();
}
