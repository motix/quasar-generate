import type { DocumentData } from 'firebase-admin/firestore';

import collectionsSyncedWithSourceId from './collectionsSyncedWithSourceId.js';

export default async function collectionsSynced<
  TSource extends DocumentData,
  TDest extends DocumentData,
>(
  sourceCollectionPath: string,
  destCollectionPath: string,
  sourceOnlyAllowed: boolean,
  destOnlyAllowed: boolean,
  nameFieldInDest: Extract<keyof TDest, string>,
  ...fieldCompares: (
    | Extract<keyof TSource & keyof TDest, string>
    | ((
        sourceDoc: TSource,
        destDoc: TDest,
      ) => {
        result: boolean;
        fieldName?: Extract<keyof TDest, string>;
        sourceText?: string;
        destText?: string;
      })
  )[]
) {
  return collectionsSyncedWithSourceId<TSource, TDest>(
    sourceCollectionPath,
    destCollectionPath,
    sourceOnlyAllowed,
    destOnlyAllowed,
    nameFieldInDest,
    (destDocSnapshot) => destDocSnapshot.id,
    ...fieldCompares,
  );
}
