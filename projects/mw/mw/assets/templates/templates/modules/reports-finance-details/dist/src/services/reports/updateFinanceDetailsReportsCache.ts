import type { CollectionReference } from 'firebase/firestore';
import { collection, doc, setDoc } from 'firebase/firestore';

import type { FinanceDetailsReportsCacheRecord } from 'models/reports/index.js';

import { getFirestore } from 'services/firebase.js';

export default async function updateFinanceDetailsReportsCache(
  ...newCacheRecords: FinanceDetailsReportsCacheRecord[]
) {
  const db = getFirestore();
  const cacheRef = collection(
    db,
    'reports_financeDetailsReportsCache',
  ) as CollectionReference<FinanceDetailsReportsCacheRecord>;

  await Promise.all(
    newCacheRecords.map((record) => setDoc(doc(cacheRef, record.year.toString()), record)),
  );
}
