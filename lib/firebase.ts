import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;
let _auth: Auth | null = null;
let _initTried = false;
let _initError: string | null = null;

function tryInit(): void {
  if (_initTried) return;
  _initTried = true;

  if (typeof window === "undefined") {
    // SSR / static-export build phase. Don't initialise here — wait for the client.
    return;
  }

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    _initError =
      "Firebase config is missing. Make sure .env.local has NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID set, then rebuild the app (next build && cap sync).";
    console.warn("[firebase]", _initError);
    return;
  }

  try {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    _db = getFirestore(_app);
    _auth = getAuth(_app);
  } catch (e) {
    _initError = `Firebase initialisation failed: ${(e as Error)?.message || e}`;
    console.error("[firebase]", _initError, e);
    _app = null;
    _db = null;
    _auth = null;
  }
}

// Eagerly attempt init on the client so existing call-sites that read `db`
// continue to work — and use a Proxy so that if the first attempt happened
// during SSR, a later read on the client retries.
function makeLazy<T extends object>(getter: () => T | null): T | null {
  if (typeof window === "undefined") return null;
  tryInit();
  return getter();
}

export const db: Firestore | null = makeLazy(() => _db);
export const auth: Auth | null = makeLazy(() => _auth);

export function getFirebaseDb(): Firestore | null {
  tryInit();
  return _db;
}

export function getFirebaseAuth(): Auth | null {
  tryInit();
  return _auth;
}

export function getFirebaseInitError(): string | null {
  tryInit();
  return _initError;
}

export function isFirebaseReady(): boolean {
  tryInit();
  return _db !== null;
}

// Helper to anonymously login
export const autoLogin = async () => {
  const a = getFirebaseAuth();
  if (!a) return null;
  try {
    const cred = await signInAnonymously(a);
    return cred.user;
  } catch (e) {
    console.warn("Firebase Auth blocked/failed", e);
    return null;
  }
};
