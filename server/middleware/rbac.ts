
import { Request, Response, NextFunction } from 'express';

type UserRole = 'super_admin' | 'customer_admin' | 'analyst' | 'viewer';

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function requireCustomerAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { customerId } = req.params;
  
  // Super admin can access any customer
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Regular users can only access their own customer
  if (customerId && customerId !== req.user.customerId) {
    return res.status(403).json({ error: 'Access denied to this customer' });
  }

  next();
}

export function requireResourceOwnership(resourceCustomerId: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Super admin can access any resource
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if resource belongs to user's customer
    if (resourceCustomerId !== req.user.customerId) {
      return res.status(403).json({ error: 'Access denied to this resource' });
    }

    next();
  };
}
