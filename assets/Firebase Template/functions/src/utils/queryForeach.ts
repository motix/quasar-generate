import type {
  CollectionGroup,
  CollectionReference,
  DocumentData,
  Query,
  QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';

export async function queryForeach<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  query: Query<AppModelType, DbModelType>,
  callback: (
    docSnapshot: QueryDocumentSnapshot<AppModelType, DbModelType>,
    prevDocSnapshot: QueryDocumentSnapshot<AppModelType, DbModelType> | undefined,
  ) => Promise<void>,
  ...orderFieldPaths: string[]
) {
  query = query.limit(1000);

  for (const fieldPath of orderFieldPaths) {
    query = query.orderBy(fieldPath);
  }

  let curDocSnapshot: QueryDocumentSnapshot<AppModelType, DbModelType> | undefined = undefined;

  await runQuery(query);

  async function runQuery(query: Query<AppModelType, DbModelType>) {
    const querySnapshot = await query.get();

    if (!querySnapshot.empty) {
      const docSnapshots = querySnapshot.docs;
      await Promise.all(
        docSnapshots.map((value) => {
          const prevDocSnapshot = curDocSnapshot;
          curDocSnapshot = value;
          return callback(value, prevDocSnapshot);
        }),
      );
      query = query.startAfter(docSnapshots[docSnapshots.length - 1]);
      await runQuery(query);
    }
  }
}

export async function collectionForeach<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionPath: string,
  callback: (
    docSnapshot: QueryDocumentSnapshot<AppModelType, DbModelType>,
    prevDocSnapshot: QueryDocumentSnapshot<AppModelType, DbModelType> | undefined,
  ) => Promise<void>,
  ...orderFieldPaths: string[]
) {
  const db = getFirestore();
  const collectionRef = db.collection(collectionPath) as CollectionReference<
    AppModelType,
    DbModelType
  >;

  return queryForeach(collectionRef, callback, ...orderFieldPaths);
}

export async function collectionGroupForeach<
  AppModelType = DocumentData,
  DbModelType extends DocumentData = DocumentData,
>(
  collectionId: string,
  callback: (
    docSnapshot: QueryDocumentSnapshot<AppModelType, DbModelType>,
    prevDocSnapshot: QueryDocumentSnapshot<AppModelType, DbModelType> | undefined,
  ) => Promise<void>,
  ...orderFieldPaths: string[]
) {
  const db = getFirestore();
  const collectionGroup = db.collectionGroup(collectionId) as CollectionGroup<
    AppModelType,
    DbModelType
  >;

  return queryForeach(collectionGroup, callback, ...orderFieldPaths);
}
