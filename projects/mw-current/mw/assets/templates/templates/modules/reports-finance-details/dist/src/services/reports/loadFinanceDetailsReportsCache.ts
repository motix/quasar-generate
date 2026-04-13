import type { CollectionReference } from 'firebase/firestore';
import { collection, documentId, getDocs, orderBy, query } from 'firebase/firestore';

import type { FinanceDetailsReportsCacheRecord } from 'models/reports/index.js';

import { getFirestore } from 'services/firebase.js';

export default async function loadFinanceDetailsReportsCache() {
  const db = getFirestore();
  const cacheRef = collection(
    db,
    'reports_financeDetailsReportsCache',
  ) as CollectionReference<FinanceDetailsReportsCacheRecord>;
  const cacheQuery = query(cacheRef, orderBy(documentId()));
  const cacheSnapshot = await getDocs(cacheQuery);
  const cache = cacheSnapshot.docs.map((value) => value.data());

  return cache;
}
