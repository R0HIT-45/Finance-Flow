import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

const permissions: Record<string, string[]> = {
  VIEWER: ['READ'],
  ANALYST: ['READ', 'SUMMARY'],
  ADMIN: ['READ', 'CREATE', 'UPDATE', 'DELETE']
};

export const authorize = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;

    if (!role || !permissions[role]?.includes(action)) {
      return res.status(403).json({
        message: `Access denied for ${role}`
      });
    }

    next();
  };
};