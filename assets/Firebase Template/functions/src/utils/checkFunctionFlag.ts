import type { CollectionReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

export default async function checkFunctionFlag(name: string) {
  const db = getFirestore();
  const collectionRef = db.collection('global_functionFlags') as CollectionReference<{
    disabled: boolean;
  }>;
  const docRef = collectionRef.doc(name);
  const snapshot = await docRef.get();
  const doc = snapshot.data();

  return !snapshot.exists || (!!doc && !doc.disabled);
}
