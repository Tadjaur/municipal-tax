import type { Context, Next } from 'hono';
import { db } from '../firebase';
import type { AuthContext } from './auth';
import type { AuditLog } from 'shared';

/**
 * Audit logging middleware - logs all write operations
 */
export const auditLog = (action: string) => {
  return async (c: Context<AuthContext>, next: Next) => {
    const user = c.get('user');

    // Store original body for before state
    let beforeState: any;
    const resourceId = c.req.param('id');

    if (resourceId && (c.req.method === 'PUT' || c.req.method === 'DELETE')) {
      // For updates/deletes, capture before state
      // This will be implemented per resource type in route handlers
    }

    // Execute the route handler
    await next();

    // Only log if operation was successful (2xx status)
    if (c.res.status >= 200 && c.res.status < 300 && user) {
      const auditEntry: Omit<AuditLog, 'id'> = {
        userId: user.uid,
        userEmail: user.email,
        action,
        resource: c.req.path,
        changes: {
          before: beforeState,
          // After state would be captured in route handler
        },
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        userAgent: c.req.header('user-agent'),
        timestamp: new Date(),
      };

      // Log asynchronously, don't wait
      db.collection('audit-logs')
        .add(auditEntry)
        .catch(error => {
          console.error('Failed to create audit log:', error);
        });
    }
  };
};

/**
 * Helper function to create audit log entry
 */
export const createAuditLog = async (
  userId: string,
  userEmail: string,
  action: string,
  resource: string,
  before?: any,
  after?: any,
  metadata?: { ip?: string; userAgent?: string }
) => {
  const auditEntry: Omit<AuditLog, 'id'> = {
    userId,
    userEmail,
    action,
    resource,
    changes: {
      before,
      after,
    },
    ip: metadata?.ip,
    userAgent: metadata?.userAgent,
    timestamp: new Date(),
  };

  await db.collection('audit-logs').add(auditEntry);
};
