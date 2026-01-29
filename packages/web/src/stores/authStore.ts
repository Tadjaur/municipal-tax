import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { Permission } from 'shared';

interface UserProfile {
  uid: string;
  email: string;
  permissions: Permission[];
  profile: {
    firstName: string;
    lastName: string;
    phone: string;
  };
}

interface AuthState {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (...permissions: Permission[]) => boolean;
  hasAllPermissions: (...permissions: Permission[]) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  loading: true,

  hasPermission: (permission: Permission) => {
    const { user } = get();
    return user?.permissions.includes(permission) ?? false;
  },

  hasAnyPermission: (...permissions: Permission[]) => {
    const { user } = get();
    if (!user) return false;
    return permissions.some(p => user.permissions.includes(p));
  },

  hasAllPermissions: (...permissions: Permission[]) => {
    const { user } = get();
    if (!user) return false;
    return permissions.every(p => user.permissions.includes(p));
  },

  signIn: async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Force token refresh to get latest custom claims
    await credential.user.getIdToken(true);
    const tokenResult = await credential.user.getIdTokenResult();

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, 'users', credential.user.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();

      // Permissions come from custom claims (set by backend)
      const permissions = (tokenResult.claims.permissions as Permission[]) || [];

      set({
        user: {
          uid: credential.user.uid,
          email: credential.user.email!,
          permissions,
          profile: userData.profile,
        },
        firebaseUser: credential.user,
      });
    } else {
      throw new Error('User profile not found');
    }
  },

  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, firebaseUser: null });
  },

  initialize: () => {
    onAuthStateChanged(auth, async firebaseUser => {
      if (firebaseUser) {
        try {
          // Get token with custom claims
          const tokenResult = await firebaseUser.getIdTokenResult();
          const permissions = (tokenResult.claims.permissions as Permission[]) || [];

          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();

            set({
              user: {
                uid: firebaseUser.uid,
                email: firebaseUser.email!,
                permissions,
                profile: userData.profile,
              },
              firebaseUser,
              loading: false,
            });
          } else {
            set({ user: null, firebaseUser: null, loading: false });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          set({ user: null, firebaseUser: null, loading: false });
        }
      } else {
        set({ user: null, firebaseUser: null, loading: false });
      }
    });
  },
}));

// Initialize auth listener
useAuthStore.getState().initialize();
