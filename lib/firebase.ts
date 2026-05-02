import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, Auth, User } from "firebase/auth";

// NOTE: Firebase web SDK config values are PUBLIC by design — they identify
// the project, they do not authenticate the user. Real security comes from
// Firebase Auth + Firestore security rules. Hard-coding the values here as a
// fallback means the app works even when .env.local was not picked up by the
// build (common cause of the "Firebase config is missing" banner on mobile
// bundles built without env injection). You can still override any field via
// the matching NEXT_PUBLIC_FIREBASE_* environment variable.
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyCVAfnWLeN8emTOEkAbJ6SsPFwVvVDkHH8",
  authDomain: "tambola-e1164.firebaseapp.com",
  projectId: "tambola-e1164",
  storageBucket: "tambola-e1164.firebasestorage.app",
  messagingSenderId: "24007368676",
  appId: "1:24007368676:web:c490f598b068664b4c31f1",
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
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

// ── Anonymous auth bootstrap ─────────────────────────────────────────────
// Firestore default security rules require an authenticated user.
// We sign the user in anonymously once on the first call and cache the
// resulting promise so every subsequent call resolves immediately.
let _authReadyPromise: Promise<User | null> | null = null;
let _authError: string | null = null;

export function ensureAuth(): Promise<User | null> {
  if (_authReadyPromise) return _authReadyPromise;

  _authReadyPromise = (async () => {
    const a = getFirebaseAuth();
    if (!a) {
      _authError = getFirebaseInitError() || "Firebase Auth is unavailable on this device.";
      return null;
    }

    // If a user is already signed in (e.g. session restored), use them.
    if (a.currentUser) return a.currentUser;

    // Otherwise wait for either a restored auth state or a fresh anon sign-in.
    try {
      const fromState = await new Promise<User | null>((resolve) => {
        const unsub = onAuthStateChanged(a, (u) => {
          unsub();
          resolve(u ?? null);
        });
        // Safety timeout — don't wait forever on a cold start
        setTimeout(() => resolve(null), 1500);
      });
      if (fromState) return fromState;

      const cred = await signInAnonymously(a);
      return cred.user;
    } catch (e) {
      const err = e as { code?: string; message?: string };
      const code = err?.code || "";
      const msg = err?.message || String(e);

      let hint = "";
      if (code === "auth/configuration-not-found" || /configuration-not-found/i.test(msg)) {
        hint =
          "\n\nFix: open the Firebase Console for project " +
          (firebaseConfig.projectId || "your project") +
          " → Authentication → click 'Get started' if you have never used Auth before → Sign-in method tab → choose 'Anonymous' → toggle Enable → Save. " +
          "Then close and reopen the app.";
      } else if (code === "auth/admin-restricted-operation") {
        hint =
          "\n\nFix: Anonymous sign-in is currently disabled. In the Firebase Console go to Authentication → Sign-in method → Anonymous → toggle Enable.";
      } else if (code === "auth/network-request-failed") {
        hint = "\n\nThe device could not reach Firebase. Check your internet connection and try again.";
      }

      _authError = `Firebase anonymous sign-in failed (${code || "unknown"}): ${msg}.${hint}`;
      console.error("[firebase]", _authError, e);
      // Clear the cache so a future retry can attempt again
      _authReadyPromise = null;
      return null;
    }
  })();

  return _authReadyPromise;
}

export function getAuthError(): string | null {
  return _authError;
}

// Back-compat alias used by older code paths
export const autoLogin = ensureAuth;
