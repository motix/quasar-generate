import type { CollectionReference } from 'firebase/firestore';
import { collection, doc, setDoc } from 'firebase/firestore';

import type { FinanceAccountsReportsCacheRecord } from 'models/reports/index.js';

import { getFirestore } from 'services/firebase.js';

export default async function updateFinanceAccountsReportsCache(
  ...newCacheRecords: FinanceAccountsReportsCacheRecord[]
) {
  const db = getFirestore();
  const cacheRef = collection(
    db,
    'reports_financeAccountsReportsCache',
  ) as CollectionReference<FinanceAccountsReportsCacheRecord>;

  await Promise.all(
    newCacheRecords.map((record) =>
      setDoc(doc(cacheRef, `${record.financeAccountId}_${record.year}`), record),
    ),
  );
}
