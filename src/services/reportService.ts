import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  onSnapshot,
  getDocs,
  where,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import { Report, Reply } from '../types';

export async function uploadMedia(file: File) {
  const path = `evidence/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const COLLECTION_PATH = 'reports';

export async function createReport(report: Partial<Report>) {
  try {
    const data = {
      ...report,
      replyCount: 0,
      status: 'New',
      confirmations: [],
      inaccurateVotes: [],
      misuseFlags: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      userId: report.isAnonymous ? null : auth.currentUser?.uid || null,
    };
    const docRef = await addDoc(collection(db, COLLECTION_PATH), data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_PATH);
  }
}

export async function voteReport(reportId: string, type: 'confirm' | 'inaccurate') {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const reportRef = doc(db, COLLECTION_PATH, reportId);
    const reportSnap = await getDoc(reportRef);
    if (!reportSnap.exists()) return;

    const currentData = reportSnap.data();
    const confirmations = currentData.confirmations || [];
    const inaccurateVotes = currentData.inaccurateVotes || [];

    let newStatus = currentData.status;
    let nextConfirmations = [...confirmations];
    let nextInaccurate = [...inaccurateVotes];

    if (type === 'confirm') {
      if (!nextConfirmations.includes(userId)) {
        nextConfirmations.push(userId);
        nextInaccurate = nextInaccurate.filter(id => id !== userId);
      }
    } else {
      if (!nextInaccurate.includes(userId)) {
        nextInaccurate.push(userId);
        nextConfirmations = nextConfirmations.filter(id => id !== userId);
      }
    }

    // Automated status logic
    if (nextConfirmations.length > 0 || currentData.replyCount > 0) {
      if (newStatus === 'New') newStatus = 'Active';
    }

    await updateDoc(reportRef, {
      confirmations: nextConfirmations,
      inaccurateVotes: nextInaccurate,
      status: newStatus,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_PATH}/${reportId}`);
  }
}

export async function flagReportMisuse(reportId: string, reason: string) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const reportRef = doc(db, COLLECTION_PATH, reportId);
    const reportSnap = await getDoc(reportRef);
    if (!reportSnap.exists()) return;

    const currentData = reportSnap.data();
    const misuseFlags = currentData.misuseFlags || [];

    if (!misuseFlags.includes(userId)) {
      misuseFlags.push(userId);
    }

    let newStatus = currentData.status;
    if (misuseFlags.length >= 3) {
      newStatus = 'Flagged for misuse';
    }

    await updateDoc(reportRef, {
      misuseFlags,
      status: newStatus,
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'report_misuse_flags'), {
      reportId,
      userId,
      reason,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_PATH}/${reportId}`);
  }
}

export async function flagReplyMisuse(reportId: string, replyId: string, reason: string) {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const replyRef = doc(db, `${COLLECTION_PATH}/${reportId}/replies`, replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) return;

    const currentData = replySnap.data();
    const misuseFlags = currentData.misuseFlags || [];

    if (!misuseFlags.includes(userId)) {
      misuseFlags.push(userId);
    }

    const isHidden = misuseFlags.length >= 3;

    await updateDoc(replyRef, {
      misuseFlags,
      isHidden
    });

    await addDoc(collection(db, 'reply_misuse_flags'), {
      reportId,
      replyId,
      userId,
      reason,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_PATH}/${reportId}/replies/${replyId}`);
  }
}

export function subscribeToReports(onUpdate: (reports: Report[]) => void) {
  const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Report[];
    onUpdate(reports);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_PATH);
  });
}

export async function addReply(reportId: string, reply: Partial<Reply>) {
  try {
    const replyData = {
      ...reply,
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid,
    };
    
    const reportRef = doc(db, COLLECTION_PATH, reportId);
    const repliesRef = collection(reportRef, 'replies');
    await addDoc(repliesRef, replyData);
    
    // Update reply count and updatedAt
    const reportSnap = await getDoc(reportRef);
    if (reportSnap.exists()) {
      const currentCount = reportSnap.data().replyCount || 0;
      await updateDoc(reportRef, { 
        replyCount: currentCount + 1,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_PATH}/${reportId}`);
  }
}

export function subscribeToReplies(reportId: string, onUpdate: (replies: Reply[]) => void) {
  const reportRef = doc(db, COLLECTION_PATH, reportId);
  const repliesRef = collection(reportRef, 'replies');
  const q = query(repliesRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const replies = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Reply[];
    onUpdate(replies);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `${COLLECTION_PATH}/${reportId}/replies`);
  });
}
