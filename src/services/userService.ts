import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Profile } from '../types';

const COLLECTION_PATH = 'profiles';

export async function getUserProfile(uid: string): Promise<Profile | null> {
  const docRef = doc(db, COLLECTION_PATH, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { uid: docSnap.id, ...docSnap.data() } as Profile;
  }
  return null;
}

export async function createUserProfile(uid: string, data: Partial<Profile>) {
  const profile: Partial<Profile> = {
    ...data,
    notificationPreferences: {
      proximityAlerts: true,
      highPriorityOnly: true,
    },
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, COLLECTION_PATH, uid), profile);
}

export async function updateProfile(uid: string, data: Partial<Profile>) {
  const docRef = doc(db, COLLECTION_PATH, uid);
  await updateDoc(docRef, data);
}
