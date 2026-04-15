import { collectionForeach } from 'utils/queryForeach.js';

export default async function clearReportsCache() {
  await collectionForeach('reports_financeAccountsReportsCache', async (docSnapshot) => {
    await docSnapshot.ref.delete();
  });

  await collectionForeach('reports_financeDetailsReportsCache', async (docSnapshot) => {
    await docSnapshot.ref.delete();
  });
}
