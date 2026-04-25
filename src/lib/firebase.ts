import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Connectivity check
async function testConnection() {
  try {
    // Only test if not in testing environment
    if (process.env.NODE_ENV !== 'test') {
      await getDocFromServer(doc(db, 'test', 'connection'));
    }
  } catch (error) {
    // Silence offline errors during initial boot as they can be transient
    if (error instanceof Error && !error.message.includes('the client is offline')) {
      console.warn("Firestore connection check failed:", error.message);
    }
  }
}
testConnection();
