import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onIdTokenChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

function readFirebaseConfig(): FirebaseClientConfig {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() || "",
  };
}

export function isFirebaseConfigured(): boolean {
  const cfg = readFirebaseConfig();
  return Boolean(
    cfg.apiKey &&
      !cfg.apiKey.includes("[YOUR_") &&
      cfg.authDomain &&
      !cfg.authDomain.includes("[YOUR_") &&
      cfg.projectId &&
      !cfg.projectId.includes("[YOUR_") &&
      cfg.appId &&
      !cfg.appId.includes("[YOUR_")
  );
}

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;

  if (cachedAuth) return cachedAuth;

  const cfg = readFirebaseConfig();
  cachedApp = getApps().length > 0 ? getApp() : initializeApp(cfg);
  cachedAuth = getAuth(cachedApp);
  return cachedAuth;
}

export async function signInFirebaseWithEmailPassword(
  email: string,
  password: string
): Promise<string> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase Authentication is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user.getIdToken();
}

export async function sendFirebasePasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase Authentication is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables."
    );
  }
  await sendPasswordResetEmail(auth, email);
}

export async function getFreshFirebaseIdToken(
  forceRefresh: boolean = false
): Promise<string | null> {
  const auth = getFirebaseAuth();
  if (!auth?.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch {
    return null;
  }
}

export function subscribeFirebaseTokenRefresh(
  onToken: (idToken: string) => void
): () => void {
  const auth = getFirebaseAuth();
  if (!auth) return () => {};

  return onIdTokenChanged(auth, async (user) => {
    if (!user) return;
    try {
      const idToken = await user.getIdToken();
      if (idToken) onToken(idToken);
    } catch {
      // Ignore background token refresh failures; API 401 handler handles fallback
    }
  });
}

export async function signOutFirebase(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;
  try {
    await signOut(auth);
  } catch {
    // Best-effort client SDK sign-out
  }
}
