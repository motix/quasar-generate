import { getFirestore } from 'firebase-admin/firestore';
import { region } from 'firebase-functions/v1';

export const processDelete = region('asia-southeast2')
  .auth.user()
  .onDelete(async (user) => {
    const db = getFirestore();
    await db.doc(`admin_userAccounts/${user.uid}`).delete();
  });
