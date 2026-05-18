import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { hashPin } from '../lib/crypto';
import type { BusinessProfile, BusinessType } from '../types';

export type AuthScreen = 'landing' | 'auth' | 'subscription' | 'business-select' | 'pos';

export interface AuthState {
  firebaseUser: FirebaseUser | null;
  profile: BusinessProfile | null;
  screen: AuthScreen;
  isLoading: boolean;
  error: string;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  activateSubscription: () => Promise<void>;
  saveBusinessProfile: (businessName: string, businessType: BusinessType, ownerName: string, ownerPin?: string) => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [screen, setScreen] = useState<AuthScreen>('landing');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = async (user: FirebaseUser): Promise<BusinessProfile | null> => {
    try {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as BusinessProfile;
      }
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
    return null;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const p = await loadProfile(user);
        setProfile(p);
        if (!p) {
          setScreen('subscription');
        } else if (p.subscriptionStatus !== 'active') {
          setScreen('subscription');
        } else if (!p.businessType) {
          setScreen('business-select');
        } else {
          setScreen('pos');
        }
      } else {
        setProfile(null);
        setScreen('landing');
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      setError(e.message || 'Google sign-in failed');
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(friendlyError(e.code));
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(friendlyError(e.code));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
    setScreen('landing');
  };

  const activateSubscription = async () => {
    if (!firebaseUser) return;
    const expiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
    const partial: Partial<BusinessProfile> = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      subscriptionStatus: 'active',
      subscriptionExpiry: expiry,
      createdAt: Date.now(),
    };
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), partial, { merge: true });
      setProfile(prev => ({ ...prev, ...partial } as BusinessProfile));
      setScreen('business-select');
    } catch (e) {
      console.error('Failed to activate subscription:', e);
    }
  };

  const saveBusinessProfile = async (businessName: string, businessType: BusinessType, ownerName: string, ownerPin?: string) => {
    if (!firebaseUser) return;
    const update: Partial<BusinessProfile> = { businessName, businessType, ownerName };
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), update, { merge: true });
      // Seed the owner staff member with the chosen PIN so usePOSData won't overwrite with defaults
      if (ownerPin) {
        const hashedPin = await hashPin(ownerPin);
        const ownerStaff = {
          id: `${firebaseUser.uid}-owner`,
          name: ownerName,
          pin: hashedPin,
          role: 'OWNER',
        };
        const staffRef = doc(db, 'users', firebaseUser.uid, 'staff', ownerStaff.id);
        await setDoc(staffRef, ownerStaff);
      }
      setProfile(prev => ({ ...prev, ...update } as BusinessProfile));
      setScreen('pos');
    } catch (e) {
      console.error('Failed to save business profile:', e);
    }
  };

  const clearError = () => setError('');

  return {
    firebaseUser,
    profile,
    screen,
    isLoading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout,
    activateSubscription,
    saveBusinessProfile,
    clearError,
  };
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use': return 'This email is already registered. Try signing in.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/invalid-credential': return 'Incorrect email or password.';
    default: return 'Something went wrong. Please try again.';
  }
}
