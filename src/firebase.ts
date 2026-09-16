import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, disableNetwork, enableNetwork } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
  } catch (e) {
    /* ignore if already disabled */
  }
};

export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
  } catch (e) {
    /* ignore if already enabled */
  }
};

// If in browser, disable network immediately when daily quota is exceeded
// to prevent continuous retry backoff loops in the console
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('koperasi_firestore_quota_exceeded');
    if (!raw) {
      // Default to quota exceeded mode for this free tier database with 0 units remaining
      localStorage.setItem(
        'koperasi_firestore_quota_exceeded',
        JSON.stringify({
          timestamp: new Date().toISOString(),
          message: 'Batas kuota harian gratis Firebase Firestore tercapai.',
        })
      );
      disableFirestoreNetwork();
    } else {
      const parsed = JSON.parse(raw);
      const date = new Date(parsed.timestamp);
      const now = new Date();
      if (
        date.getUTCDate() === now.getUTCDate() &&
        date.getUTCMonth() === now.getUTCMonth() &&
        date.getUTCFullYear() === now.getUTCFullYear()
      ) {
        disableFirestoreNetwork();
      }
    }
  } catch (e) {
    disableFirestoreNetwork();
  }
}

export default app;
