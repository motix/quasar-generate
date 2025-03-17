import type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  UpdateData,
} from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';

import checkFunctionFlag from './checkFunctionFlag.js';

export default async function adapterUpdate<
  TSource extends DocumentData,
  TDest extends DocumentData,
  TGeneratedFields extends keyof TDest,
>(
  sourceChangeAfter: DocumentSnapshot<TSource, TSource>,
  id: string,
  destCollectionPath: string,
  copyFields: (
    source: TSource,
    dest: TDest | undefined,
  ) => Promise<UpdateData<TDest> & Pick<TDest, keyof (TDest | TSource) | TGeneratedFields>>,
  newDest: (
    intersection: Pick<TDest, keyof (TDest | TSource) | TGeneratedFields>,
    source: TSource,
  ) => TDest,
  nameField: Extract<keyof (TDest | TSource), string>,
) {
  const loggerEnabled = await checkFunctionFlag('adapterUpdate-logger');

  const db = getFirestore();
  const destRef = db.collection(destCollectionPath).doc(id) as DocumentReference<TDest, TDest>;

  const source = sourceChangeAfter.data();

  if (source) {
    if (loggerEnabled) {
      info(
        `[adapterUpdate] Transferring document "${sourceChangeAfter.get(nameField)}" from "${sourceChangeAfter.ref.parent.path}" to "${destCollectionPath}"...`,
      );
    }

    const destSnapshot = await destRef.get();
    const destData = await copyFields(source, destSnapshot.data());

    if (destSnapshot.exists) {
      await destRef.update(destData);
    } else {
      const dest = newDest(destData, source);
      await destRef.set(dest);
    }
  } else {
    if (loggerEnabled) {
      info(
        `[adapterUpdate] Deleting document "${sourceChangeAfter.get(nameField)}" in "${destCollectionPath}" following the related one in "${sourceChangeAfter.ref.parent.path}"...`,
      );
    }

    await destRef.delete();
  }
}
