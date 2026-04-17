import { collection, getDocs, limit, query, where } from 'firebase/firestore';

import { indexNormalizeString } from 'utils/normalization.js';

import { getFirestore } from 'services/firebase.js';

export async function validateUniqueField<TValue>(
  collectionPath: string,
  fieldName: string,
  value: TValue,
  excludeId?: string,
) {
  const db = getFirestore();

  const collectionRef = collection(db, collectionPath);
  const q = query(collectionRef, where(fieldName, '==', value), limit(2));
  const qSnapshot = await getDocs(q);
  const result =
    qSnapshot.empty ||
    (!!excludeId && qSnapshot.docs.length === 1 && qSnapshot.docs[0]!.id === excludeId);

  const collectionRefNormalized = collection(db, `${collectionPath}_normalized`);
  const qNormalized = query(
    collectionRefNormalized,
    where(fieldName, '==', indexNormalizeString(String(value))),
    limit(2),
  );
  const qSnapshotNormalized = await getDocs(qNormalized);
  const resultNormalized =
    qSnapshotNormalized.empty ||
    (!!excludeId &&
      qSnapshotNormalized.docs.length === 1 &&
      qSnapshotNormalized.docs[0]!.id === excludeId);

  return result && resultNormalized;
}
