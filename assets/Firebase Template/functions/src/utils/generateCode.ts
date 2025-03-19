import type { CollectionReference, DocumentReference } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

import type { GeneratedCode } from 'models/index.js';

export default async function generateCode(prefix: string, ...parts: string[]) {
  const mainCode = prefix + parts.join('-');
  let code = mainCode;

  const db = getFirestore();
  await db.runTransaction(async (transaction) => {
    const generatedCodesRef = db.collection(
      'global_generatedCodes',
    ) as CollectionReference<GeneratedCode>;
    const latestCodesQuery = generatedCodesRef
      .where('mainCode', '==', mainCode)
      .orderBy('suffix', 'desc')
      .limit(1);

    const latestCodesSnapshot = await transaction.get(latestCodesQuery);
    const suffix = latestCodesSnapshot.empty ? 0 : latestCodesSnapshot.docs[0]!.data().suffix + 1;

    if (suffix > 0) {
      code += `-${suffix.toString()}`;
    }

    const newCodeRef = db.doc(`global_generatedCodes/${code}`) as DocumentReference<
      GeneratedCode,
      GeneratedCode
    >;

    transaction.create<GeneratedCode, GeneratedCode>(newCodeRef, { mainCode, suffix });
  });

  return code;
}
