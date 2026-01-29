import type { Context, Next } from 'hono';
import { auth } from '../firebase';
import { USER_ROLES, ROLE_PERMISSIONS, type UserRole, type Permission } from 'shared';

// Extend Hono context with user data
export interface AuthContext {
  Variables: {
    user: {
      uid: string;
      email: string;
      role: UserRole;
      permissions: Permission[];
    };
  };
}

/**
 * Authentication middleware - verifies Firebase token
 */
export const requireAuth = async (c: Context<AuthContext>, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await auth.verifyIdToken(token);

    // Get user role and permissions from custom claims or Firestore
    const role = (decodedToken.role as UserRole) || USER_ROLES.OPERATOR;
    const permissions = ROLE_PERMISSIONS[role] || [];

    c.set('user', {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role,
      permissions,
    });

    await next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ success: false, error: 'Invalid or expired token' }, 401);
  }
};

/**
 * Authorization middleware - checks if user has required permission
 */
export const requirePermission = (...requiredPermissions: Permission[]) => {
  return async (c: Context<AuthContext>, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    const hasPermission = requiredPermissions.some(perm => user.permissions.includes(perm));

    if (!hasPermission) {
      return c.json(
        {
          success: false,
          error: 'Insufficient permissions',
          required: requiredPermissions,
        },
        403
      );
    }

    await next();
  };
};

/**
 * Role-based middleware - checks if user has required role
 */
export const requireRole = (...roles: UserRole[]) => {
  return async (c: Context<AuthContext>, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    if (!roles.includes(user.role)) {
      return c.json(
        {
          success: false,
          error: 'Insufficient role',
          required: roles,
        },
        403
      );
    }

    await next();
  };
};
