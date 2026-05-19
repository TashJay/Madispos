import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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
  trialDaysLeft: number | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  activateSubscription: () => Promise<void>;
  saveBusinessProfile: (businessName: string, businessType: BusinessType, ownerName: string, ownerPin?: string) => Promise<void>;
  navigateToSubscription: () => void;
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

  const routeUser = async (user: FirebaseUser) => {
    setFirebaseUser(user);
    const p = await loadProfile(user);
    setProfile(p);
    if (!p) {
      const trialProfile: Partial<BusinessProfile> = {
        uid: user.uid,
        email: user.email || '',
        subscriptionStatus: 'trial',
        trialStartDate: Date.now(),
        createdAt: Date.now(),
      } as any;
      try {
        await setDoc(doc(db, 'users', user.uid), trialProfile, { merge: true });
        setProfile(trialProfile as BusinessProfile);
        setScreen('business-select');
      } catch {
        setScreen('subscription');
      }
    } else if (p.subscriptionStatus === 'trial') {
      const trialAge = (Date.now() - (p.trialStartDate || p.createdAt || Date.now())) / (1000 * 60 * 60 * 24);
      if (trialAge < 14) {
        setScreen(p.businessType ? 'pos' : 'business-select');
      } else {
        setScreen('subscription');
      }
    } else if (p.subscriptionStatus !== 'active') {
      setScreen('subscription');
    } else if (!p.businessType) {
      setScreen('business-select');
    } else {
      setScreen('pos');
    }
  };

  useEffect(() => {
    // Check for pending redirect result first (Google redirect sign-in)
    getRedirectResult(auth)
      .then(result => {
        if (result?.user) {
          // Handled by onAuthStateChanged below
        }
      })
      .catch((e: any) => {
        if (e?.code !== 'auth/no-current-user') {
          setError(friendlyError(e?.code) || 'Google sign-in failed. Please try again.');
        }
      });

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await routeUser(user);
      } else {
        setFirebaseUser(null);
        setProfile(null);
        setScreen('landing');
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      // Try popup first; fall back to redirect if popup is blocked
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      const code = e?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/popup-closed-by-user'
      ) {
        // Fall back to redirect flow
        try {
          await signInWithRedirect(auth, provider);
        } catch (re: any) {
          setError(friendlyError(re?.code) || 'Google sign-in failed. Please try again.');
        }
      } else {
        setError(friendlyError(code) || e.message || 'Google sign-in failed');
      }
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

  const resetPassword = async (email: string) => {
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e: any) {
      throw new Error(friendlyError(e.code) || 'Could not send reset email. Please try again.');
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
      createdAt: profile?.createdAt || Date.now(),
    };
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), partial, { merge: true });
    } catch (e: any) {
      console.error('Failed to save subscription to Firestore:', e);
      setError('Could not save subscription — check your Firestore database is created and rules are deployed. (' + (e?.message || 'Unknown error') + ')');
      return;
    }
    setProfile(prev => ({ ...prev, ...partial } as BusinessProfile));
    setScreen(profile?.businessType ? 'pos' : 'business-select');
  };

  const navigateToSubscription = () => setScreen('subscription');

  const saveBusinessProfile = async (businessName: string, businessType: BusinessType, ownerName: string, ownerPin?: string) => {
    if (!firebaseUser) return;
    const update: Partial<BusinessProfile> = { businessName, businessType, ownerName };
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), update, { merge: true });
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
    } catch (e: any) {
      console.error('Failed to save business profile:', e);
      setError('Could not save your business profile — check your Firestore database is set up and rules are deployed. (' + (e?.message || 'Unknown error') + ')');
      return;
    }
    setProfile(prev => ({ ...prev, ...update } as BusinessProfile));
    setScreen('pos');
  };

  const clearError = () => setError('');

  const trialDaysLeft: number | null =
    profile && profile.subscriptionStatus === 'trial'
      ? Math.max(0, 14 - Math.floor((Date.now() - (profile.trialStartDate || profile.createdAt || Date.now())) / (1000 * 60 * 60 * 24)))
      : null;

  return {
    firebaseUser,
    profile,
    screen,
    isLoading,
    error,
    trialDaysLeft,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    logout,
    activateSubscription,
    saveBusinessProfile,
    navigateToSubscription,
    clearError,
  };
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/user-not-found': return 'No account found with this email. Click "Create Account" to sign up first.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use': return 'This email is already registered. Switch to "Sign In" instead.';
    case 'auth/weak-password': return 'Password must be at least 6 characters.';
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/invalid-credential': return 'Incorrect email or password. If you are new, click "Create Account" first.';
    case 'auth/unauthorized-domain': return 'This domain is not authorised for Google sign-in. Go to Firebase Console → Authentication → Settings → Authorised Domains and add this site\'s domain.';
    case 'auth/popup-blocked': return 'Pop-up was blocked. Redirecting to Google sign-in…';
    case 'auth/popup-closed-by-user': return 'Sign-in was cancelled. Please try again.';
    case 'auth/operation-not-allowed': return 'Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in methods.';
    case 'auth/network-request-failed': return 'Network error. Please check your connection and try again.';
    default: return 'Something went wrong. Please try again.';
  }
}
