import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';

import checkFunctionFlag from './checkFunctionFlag.js';
import { indexNormalizeString } from './normalization.js';

export default async function docNormalization<T>(
  changeBefore: DocumentSnapshot,
  changeAfter: DocumentSnapshot,
  nameField: Extract<keyof T, string>,
  ...fields: Extract<keyof T, string>[]
) {
  if (fields.length === 0) {
    throw new Error('At least one field must be provided.');
  }

  const loggerEnabled = await checkFunctionFlag('docNormalization-logger');

  const db = getFirestore();
  const collectionPath = changeAfter.ref.parent.path;
  const normalizedCollectionPath = `${collectionPath}_normalized`;
  const normalizedCollectionRef = db.collection(normalizedCollectionPath);
  const normalizedDocRef = normalizedCollectionRef.doc(changeAfter.ref.id);

  if (changeAfter.exists) {
    if (loggerEnabled) {
      info(
        `[docNormalization] Normalizing document "${changeAfter.get(nameField)}" in "${collectionPath}"...`,
      );
    }

    const normalizedDoc: Record<string, string> = {};

    fields.forEach((field) => {
      const normalizedValue = indexNormalizeString(String(changeAfter.get(field)));

      if (normalizedValue != null) {
        normalizedDoc[field] = normalizedValue;
      }
    });

    await normalizedDocRef.set(normalizedDoc);
  } else {
    if (loggerEnabled) {
      info(
        `[docNormalization] Deleting normalized document "${changeBefore.get(fields[0]!)}" in "${collectionPath}"...`,
      );
    }

    await normalizedDocRef.delete();
  }
}
