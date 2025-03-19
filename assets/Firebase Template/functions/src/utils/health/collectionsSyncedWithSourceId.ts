import type { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

import { collectionForeach } from 'utils/queryForeach.js';

import type { HealthCheckResult } from 'models/health/index.js';

export default async function collectionsSyncedWithSourceId<TSource, TDest>(
  sourceCollectionPath: string,
  destCollectionPath: string,
  sourceOnlyAllowed: boolean,
  destOnlyAllowed: boolean,
  nameFieldInDest: Extract<keyof TDest, string>,
  selectSourceId: (destDocSnapshot: QueryDocumentSnapshot<TDest>) => string,
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
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  const db = getFirestore();
  const sourceCollectionRef = db.collection(sourceCollectionPath) as CollectionReference<TSource>;
  const destCollectionRef = db.collection(destCollectionPath) as CollectionReference<TDest>;
  const destDocSnapshots = (await destCollectionRef.get()).docs;

  let destOnlyDocs = 0;
  let matchedDocs = 0;
  let unmatchedDocs = 0;
  const destKeys: string[] = [];
  const destOnlyIds: string[] = [];
  for (const destDocSnapshot of destDocSnapshots) {
    const destDoc = destDocSnapshot.data();
    const sourceDocSnapshot = await sourceCollectionRef.doc(selectSourceId(destDocSnapshot)).get();
    const sourceDoc = sourceDocSnapshot.data();

    destKeys.push(selectSourceId(destDocSnapshot));

    if (sourceDoc) {
      let hasUnmatchedInfo = false;

      for (const fieldCompare of fieldCompares) {
        if (typeof fieldCompare === 'string') {
          const sourceValue = sourceDoc[fieldCompare];
          const destValue = destDoc[fieldCompare];

          if (destValue !== sourceValue) {
            hasUnmatchedInfo = true;
            errors.push(
              `\`${destCollectionPath}/${destDocSnapshot.id}.${fieldCompare}\`'s value \`${String(destValue)}\` not matched with \`${sourceCollectionPath}/${sourceDocSnapshot.id}.${fieldCompare}\`'s value \`${String(sourceValue)}\`. Destination doc: \`${String(destDoc[nameFieldInDest])}\`.`,
            );
          }
        } else {
          const result = fieldCompare(sourceDoc, destDoc);
          if (!result.result) {
            hasUnmatchedInfo = true;
            errors.push(
              `\`${destCollectionPath}/${destDocSnapshot.id}.${result.fieldName}\`'s value \`${result.destText}\` not matched with \`${sourceCollectionPath}/${sourceDocSnapshot.id}.${result.fieldName}\`'s value \`${result.sourceText}\`. Destination doc: \`${String(destDoc[nameFieldInDest])}\`.`,
            );
          }
        }
      }

      if (hasUnmatchedInfo) {
        unmatchedDocs++;
      } else {
        matchedDocs++;
      }
    } else {
      destOnlyDocs++;
      destOnlyIds.push(destDocSnapshot.id);
    }
  }

  let sourceOnlyIds: string[] = [];

  if (destKeys.length > 0) {
    await collectionForeach(sourceCollectionPath, (docSnapshot) => {
      if (!destKeys.includes(docSnapshot.id)) {
        sourceOnlyIds.push(docSnapshot.id);
      }

      return Promise.resolve();
    });
  } else {
    const sourceOnlyQuery = sourceCollectionRef.limit(1);
    sourceOnlyIds = (await sourceOnlyQuery.get()).docs.map((docSnapshot) => docSnapshot.id);
  }

  const sourceOnlyDocs = sourceOnlyIds.length;

  const hasSource = sourceOnlyDocs > 0 || destDocSnapshots.length > destOnlyDocs;
  const hasDest = destDocSnapshots.length > 0;
  const hasSourceOnly = sourceOnlyDocs > 0;
  const hasDestOnly = destOnlyDocs > 0;
  const hasMatched = matchedDocs > 0;
  const hasUnmatched = unmatchedDocs > 0;

  if (hasSourceOnly) {
    if (sourceOnlyAllowed) {
      if (hasDest) {
        info.push(
          `${sourceOnlyDocs} documents(s) from \`${sourceCollectionPath}\` are not transferred to \`${destCollectionPath}\`.`,
        );
      } else {
        info.push(
          `All documents(s) from \`${sourceCollectionPath}\` are not transferred to \`${destCollectionPath}\`.`,
        );
      }
    } else {
      if (hasDest) {
        sourceOnlyIds.forEach((id) => {
          errors.push(
            `\`${sourceCollectionPath}/${id}\` is not transferred to \`${destCollectionPath}\`.`,
          );
        });
      } else {
        errors.push(
          `All documents(s) from \`${sourceCollectionPath}\` are not transferred to \`${destCollectionPath}\`.`,
        );
      }
    }
  }

  if (hasDestOnly) {
    if (destOnlyAllowed) {
      info.push(
        `${destOnlyDocs} documents(s) in \`${destCollectionPath}\` don't have related documents in \`${sourceCollectionPath}\`.`,
      );
    } else {
      destOnlyIds.forEach((id) => {
        errors.push(
          `\`${destCollectionPath}/${id}\` doesn't have related document in \`${sourceCollectionPath}\`.`,
        );
      });
    }
  }

  if (!hasUnmatched && hasMatched) {
    if (hasDestOnly) {
      successes.push(
        `Each document in \`${destCollectionPath}\` has the same info as in \`${sourceCollectionPath}\` if it has related document.`,
      );
    } else {
      if (hasSourceOnly) {
        successes.push(
          `Each document in \`${destCollectionPath}\` has the same info as in \`${sourceCollectionPath}\`.`,
        );
      } else {
        successes.push(`\`${sourceCollectionPath}\` and \`${destCollectionPath}\` are identical.`);
      }
    }
  }

  if (!hasSource) {
    info.push(`There is no document in \`${sourceCollectionPath}\`.`);
  }

  if (!hasDest) {
    info.push(`There is no document in \`${destCollectionPath}\`.`);
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
}
