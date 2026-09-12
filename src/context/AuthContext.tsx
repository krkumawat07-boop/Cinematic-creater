import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile,
  type User 
} from '../config/firebase.js';
import { UserProfile } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  firebaseUser: User | null;
  user: UserProfile | null;
  idToken: string | null;
  loading: boolean;
  authError: string | null;
  clearError: () => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearError = () => setAuthError(null);

  const fetchUserProfile = async (token: string): Promise<UserProfile | null> => {
    try {
      api.setAuthToken(token);
      const res = await api.getProfile();
      return res.user;
    } catch (err: any) {
      console.warn('Failed to sync user profile from server:', err.message);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      clearError();
      if (fbUser) {
        try {
          const token = await fbUser.getIdToken();
          setFirebaseUser(fbUser);
          setIdToken(token);
          api.setAuthToken(token);

          // Sync verified profile from backend (creates initial free 100-credit account on 1st login)
          const profile = await fetchUserProfile(token);
          if (profile) {
            setUser(profile);
          } else {
            // Safe fallback profile while connecting
            setUser({
              id: fbUser.uid,
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Cinematic Creator',
              photoUrl: fbUser.photoURL || '',
              plan: 'free',
              credits: 100,
              role: 'user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (err: any) {
          console.error('Auth token fetch failed:', err);
          setAuthError(err.message);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIdToken(null);
        api.setAuthToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      const cred = await signInWithPopup(auth, googleProvider);
      const token = await cred.user.getIdToken();
      api.setAuthToken(token);
      const profile = await fetchUserProfile(token);
      if (profile) setUser(profile);
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      clearError();
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const token = await cred.user.getIdToken();
      api.setAuthToken(token);
      const profile = await fetchUserProfile(token);
      if (profile) setUser(profile);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, displayName?: string) => {
    try {
      setLoading(true);
      clearError();
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      const token = await cred.user.getIdToken();
      api.setAuthToken(token);
      const profile = await fetchUserProfile(token);
      if (profile) setUser(profile);
    } catch (err: any) {
      setAuthError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      clearError();
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      setAuthError(err.message || 'Password reset request failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setFirebaseUser(null);
      setUser(null);
      setIdToken(null);
      api.setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!auth.currentUser) return;
    try {
      const token = await auth.currentUser.getIdToken(true);
      setIdToken(token);
      api.setAuthToken(token);
      const profile = await fetchUserProfile(token);
      if (profile) setUser(profile);
    } catch (err) {
      console.warn('Could not refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        idToken,
        loading,
        authError,
        clearError,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
