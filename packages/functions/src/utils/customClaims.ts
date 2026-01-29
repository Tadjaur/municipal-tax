import { auth } from '../firebase';
import type { Permission } from 'shared';

/**
 * Set custom claims for a user (permissions)
 * This should be called when creating or updating user permissions
 */
export const setUserPermissions = async (uid: string, permissions: Permission[]): Promise<void> => {
  try {
    await auth.setCustomUserClaims(uid, { permissions });
    console.log(`Set permissions for user ${uid}:`, permissions);
  } catch (error) {
    console.error('Error setting custom claims:', error);
    throw error;
  }
};

/**
 * Get user's current custom claims
 */
export const getUserClaims = async (uid: string) => {
  try {
    const user = await auth.getUser(uid);
    return user.customClaims || {};
  } catch (error) {
    console.error('Error getting custom claims:', error);
    throw error;
  }
};

/**
 * Add permissions to a user (merges with existing)
 */
export const addUserPermissions = async (
  uid: string,
  newPermissions: Permission[]
): Promise<void> => {
  const claims = await getUserClaims(uid);
  const existingPermissions = (claims.permissions as Permission[]) || [];

  // Merge and deduplicate
  const allPermissions = Array.from(new Set([...existingPermissions, ...newPermissions]));

  await setUserPermissions(uid, allPermissions);
};

/**
 * Remove permissions from a user
 */
export const removeUserPermissions = async (
  uid: string,
  permissionsToRemove: Permission[]
): Promise<void> => {
  const claims = await getUserClaims(uid);
  const existingPermissions = (claims.permissions as Permission[]) || [];

  const newPermissions = existingPermissions.filter(p => !permissionsToRemove.includes(p));

  await setUserPermissions(uid, newPermissions);
};
