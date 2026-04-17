import type { MapOptions, Mapper } from '@automapper/core';

import type { UnwrapRef } from 'vue';

import { uid } from 'quasar';

import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Query,
  UpdateData,
} from 'firebase/firestore';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore';

import { findIndex } from 'lodash-es';

import { urlFriendlyNormalizeString } from 'utils/normalization.js';

import { getFirestore } from 'services/firebase.js';

import { requiredConfigEntries } from 'composables/useConfig.js';

import type {
  CreateDocActionPayload,
  DeleteDocActionPayload,
  DocModel,
  LoadAllDocsActionPayload,
  LoadDocsPageActionPayload,
  LoadRealtimeDocActionPayload,
  LoadRealtimeDocActionResult,
  RealtimeDocIndex,
  ReleaseDocsActionPayload,
  ReleaseRealtimeDocActionPayload,
  StoreOptions,
  UpdateDocActionPayload,
} from './index.js';
import { defineActions } from './index.js';
import type { DocStateInterface } from './state.js';

function buildActions<T extends DocModel, TVm, TAm extends DocumentData>(
  collectionPath: string,
  mapper: Mapper,
  modelName: string,
  viewModelName: string,
  apiModelName: string,
  options: StoreOptions<T, TVm, TAm>,
) {
  let releaseDocsTimeoutId: ReturnType<typeof setTimeout> | null = null;

  return defineActions({
    __flag: (model: T, viewModel: TVm, apiModel: TAm) => ({
      model,
      viewModel,
      apiModel,
    }),

    loadAllDocs({ queryConstraints }: LoadAllDocsActionPayload) {
      return new Promise<void>((resolve, reject) => {
        void this.loadDocsPage({
          page: 1000,
          queryConstraints,
          done: () => {
            reject(new Error('[mnapp-firebase-firestore] Maximum data pages 1000 reached.'));
          },
          outOfRange: () => resolve(),
          error: (err) => reject(err),
        });
      });
    },

    async loadDocsPage({
      page,
      queryConstraints,
      done,
      outOfRange,
      error,
    }: LoadDocsPageActionPayload) {
      if (releaseDocsTimeoutId) {
        clearTimeout(releaseDocsTimeoutId);
        releaseDocsTimeoutId = null;
      }

      const listLength = (page + 1) * this.docsPageSize;
      if (this.docs.length >= listLength) {
        done();
        return;
      }

      const db = getFirestore();
      const collectionRef = collection(db, collectionPath) as CollectionReference<TAm>;
      const q = query(collectionRef, ...queryConstraints, limit(this.docsPageSize));

      do {
        try {
          let isOutOfRange = false;
          let isEmpty = false;

          await loadDocsNextPage(
            this.$state,
            q,
            // outOfRange
            () => {
              if (page > 0) {
                isOutOfRange = true;
                outOfRange && outOfRange();
              } else {
                isEmpty = true;
              }
            },
          );

          if (isOutOfRange) {
            return;
          }

          if (isEmpty) {
            break;
          }
        } catch (err) {
          error && error(err as Error);
          return;
        }

        if (this.docs.length < listLength && this.docs.length > page * this.docsPageSize) {
          // Can be the last page. If no more doc found, outOfRange wouldn't fire.
          try {
            await loadDocsNextPage(
              this.$state,
              q,
              // outOfRange
              () => undefined,
            );
          } catch (err) {
            error && error(err as Error);
          }

          break;
        }
      } while (this.docs.length < listLength);

      done();
    },

    releaseDocs({ immediately }: ReleaseDocsActionPayload) {
      if (immediately) {
        this.docs = [];
      } else {
        const { releaseDocsTimeout } = requiredConfigEntries('releaseDocsTimeout');

        releaseDocsTimeoutId = setTimeout(() => {
          this.docs = [];
        }, releaseDocsTimeout);
      }
    },

    loadRealtimeDoc({
      findKey,
      findKeyField,
      done,
      notFound,
      deleted,
      error,
    }: LoadRealtimeDocActionPayload) {
      const docKey = uid();

      const release = () => {
        if (this.realtimeDocs[docKey]) {
          this.realtimeDocs[docKey].unsubscribe();
          delete this.realtimeDocs[docKey];
        }
      };

      const result: LoadRealtimeDocActionResult = {
        docKey,
        release,
      };

      const db = getFirestore();

      let id: string;

      if (findKeyField) {
        const collectionRef = collection(db, collectionPath) as CollectionReference<TAm>;
        const q = query(collectionRef, where(findKeyField, '==', findKey));
        getDocs(q)
          .then((querySnapshot) => {
            if (querySnapshot.docs.length === 0) {
              notFound && notFound();
            } else if (querySnapshot.docs.length > 1) {
              throw new Error(
                `[mnapp-firebase-firestore] '${findKey}' is not unique for '${findKeyField}' in '${collectionPath}'`,
              );
            } else {
              id = querySnapshot.docs[0]!.id;
              loadDocById(
                id,
                docKey,
                this.realtimeDocs,
                (id) => this.onDocUpdate(id),
                (id) => this.onDocDelete(id),
                done,
                notFound,
                deleted,
                error,
              );
            }
          })
          .catch((err: Error) => {
            error && error(err);
          });
      } else {
        id = findKey;
        loadDocById(
          id,
          docKey,
          this.realtimeDocs,
          (id) => this.onDocUpdate(id),
          (id) => this.onDocDelete(id),
          done,
          notFound,
          deleted,
          error,
        );
      }

      return result;
    },

    releaseRealtimeDoc({ docKey }: ReleaseRealtimeDocActionPayload) {
      (
        this.realtimeDocs[docKey] ||
        (() => {
          throw new Error(`[mnapp-firebase-firestore] Realtime doc '${docKey}' not available.`);
        })()
      ).unsubscribe();
      delete this.realtimeDocs[docKey];
    },

    async createDoc(payload: CreateDocActionPayload<TVm>) {
      options.beforeCreate && (await options.beforeCreate(payload));

      const { doc: docVm, id, idField } = payload;

      const docAm = mapper.map<TVm, TAm>(docVm, viewModelName, apiModelName);

      const db = getFirestore();
      const collectionRef = collection(db, collectionPath) as CollectionReference<TAm>;
      let docRef: DocumentReference<TAm>;

      if (id) {
        docRef = doc(collectionRef, id);
        await setDoc(docRef, docAm);
      } else if (idField) {
        const idFromField = urlFriendlyNormalizeString(String(docVm[idField])) as string;
        docRef = doc(collectionRef, idFromField);
        await runTransaction(db, async (transaction) => {
          const existingDocSnapshot = await transaction.get(docRef);

          if (existingDocSnapshot.exists()) {
            throw new Error(
              `[mnapp-firebase-firestore] Failed to generate id from '${String(idField)}' field. '${
                docRef.path
              }' already exists.`,
            );
          }

          transaction.set(docRef, docAm);
        });
      } else {
        docRef = await addDoc(collectionRef, docAm);
      }

      const newDocM = await this.onDocCreate(docRef.id);
      const newDocVm = mapper.map<T, TVm>(newDocM, modelName, viewModelName);

      return newDocVm;
    },

    async updateDoc(payload: UpdateDocActionPayload<T | TVm>) {
      options.beforeUpdate && (await options.beforeUpdate(payload));

      const { docKey, doc: docMOrVm, isViewModel } = payload;

      const id =
        this.realtimeDocs[docKey]?.doc?.id ||
        (() => {
          throw new Error(`[mnapp-firebase-firestore] Realtime doc '${docKey}' not available.`);
        })();

      let docAm: TAm;

      if (isViewModel) {
        docAm = mapper.map<TVm, TAm>(docMOrVm as TVm, viewModelName, apiModelName);
      } else {
        docAm = mapper.map<T, TAm>(docMOrVm as T, modelName, apiModelName);
      }

      const db = getFirestore();
      const docRef = doc(db, collectionPath, id) as DocumentReference<TAm, TAm>;
      await updateDoc<TAm, TAm>(docRef, docAm as UpdateData<TAm>);
      await this.onDocUpdate(id);
    },

    async deleteDoc(payload: DeleteDocActionPayload) {
      options.beforeDelete && (await options.beforeDelete(payload));

      const { docKey } = payload;

      const id =
        this.realtimeDocs[docKey]?.doc?.id ||
        (() => {
          throw new Error(`[mnapp-firebase-firestore] Realtime doc '${docKey}' not available.`);
        })();

      const db = getFirestore();
      const docRef = doc(db, collectionPath, id);
      await deleteDoc(docRef);
      this.onDocDelete(id);
    },

    async onDocCreate(id: string) {
      const db = getFirestore();
      const docRef = doc(db, collectionPath, id) as DocumentReference<TAm>;

      this.releaseDocs({ immediately: true });

      const newDocAm = await getNewDoc(docRef);

      !newDocAm &&
        (() => {
          throw new Error(
            `[mnapp-firebase-firestore] Failed to retrieve created doc '${collectionPath}/${docRef.id}'.`,
          );
        })();

      const idMap = new Map([[newDocAm, docRef.id]]);
      const extraArgs = () => ({ idMap });
      const newDocM = mapper.map<TAm, T>(newDocAm, apiModelName, modelName, {
        extraArgs,
      });

      this.recentlyAddedDocs.push(
        newDocM as UnwrapRef<DocStateInterface<T>>['recentlyAddedDocs'][number],
      );

      return newDocM;
    },

    async onDocUpdate(id: string) {
      const db = getFirestore();
      const docRef = doc(db, collectionPath, id) as DocumentReference<TAm>;

      this.releaseDocs({ immediately: true });

      const newDocAm = await getNewDoc(docRef);

      !newDocAm &&
        (() => {
          throw new Error(
            `[mnapp-firebase-firestore] Failed to retrieve updated doc '${collectionPath}/${docRef.id}'.`,
          );
        })();

      const idMap = new Map([[newDocAm, id]]);
      const extraArgs = () => ({ idMap });
      const newDocM = mapper.map<TAm, T>(newDocAm, apiModelName, modelName, {
        extraArgs,
      });

      const addedIndex = findIndex(this.recentlyAddedDocs, ['id', id]);

      if (addedIndex > -1) {
        this.recentlyAddedDocs[addedIndex] = newDocM as UnwrapRef<
          DocStateInterface<T>
        >['recentlyAddedDocs'][number];
      } else {
        const updatedIndex = findIndex(this.recentlyUpdatedDocs, ['id', id]);

        if (updatedIndex > -1) {
          this.recentlyUpdatedDocs[updatedIndex] = newDocM as UnwrapRef<
            DocStateInterface<T>
          >['recentlyUpdatedDocs'][number];
        } else {
          this.recentlyUpdatedDocs.push(
            newDocM as UnwrapRef<DocStateInterface<T>>['recentlyUpdatedDocs'][number],
          );
        }
      }
    },

    onDocDelete(id: string) {
      this.releaseDocs({ immediately: true });

      this.recentlyDeletedDocs.push(id);
    },
  });

  async function loadDocsNextPage(
    state: UnwrapRef<DocStateInterface<T>>,
    q: Query<TAm>,
    outOfRange: () => void,
  ) {
    if (state.docs.length > 0) {
      const lastDoc = state.docs[state.docs.length - 1]!;
      const lastDocRef = doc(q.firestore, collectionPath, lastDoc.id);
      q = query(q, startAfter(await getDoc(lastDocRef)));
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      outOfRange();
    } else {
      const docAndIds = querySnapshot.docs.map((docSnapshot) => {
        return [docSnapshot.data(), docSnapshot.id];
      });
      const docs = docAndIds.map((docAndId) => docAndId[0] as TAm);

      options.afterLoadArray && (await options.afterLoadArray(docs));

      !options.afterLoadArray &&
        options.afterLoad &&
        (await Promise.all(
          docs.map((doc) => (options.afterLoad && options.afterLoad(doc)) || Promise.resolve()),
        ));

      const docIdMap = new Map(docAndIds as Iterable<readonly [TAm, string]>);
      const extraArgs = () => ({ idMap: docIdMap });
      const mapOptions: MapOptions<TAm[], T[]> = {
        extraArgs,
      };

      if (options.mapperOptions?.apiModelToModelAfterMap) {
        mapOptions.afterMap = options.mapperOptions.apiModelToModelAfterMap;
      }

      state.docs = state.docs.concat(
        mapper.mapArray<TAm, T>(docs, apiModelName, modelName, mapOptions) as UnwrapRef<T[]>,
      );
    }
  }

  function loadDocById(
    id: string,
    docKey: string,
    realtimeDocs: RealtimeDocIndex<T>,
    onDocUpdate: (id: string) => Promise<void>,
    onDocDelete: (id: string) => void,
    done: () => void,
    notFound?: () => void,
    deleted?: () => void,
    error?: (error: Error) => void,
  ) {
    const db = getFirestore();
    const docRef = doc(db, collectionPath, id) as DocumentReference<TAm>;
    let firstSnapshot = true;
    const unsubscribe = onSnapshot(
      docRef,
      // onNext
      (docSnapshot) => {
        const data = docSnapshot.data();
        const realtimeDoc =
          realtimeDocs[docKey] ||
          (() => {
            throw new Error(`[mnapp-firebase-firestore] Realtime doc '${docKey}' not available.`);
          })();

        if (data) {
          if (options.afterLoad) {
            options
              .afterLoad(data)
              .then(() => {
                completeLoading(data);
              })
              .catch((error) => {
                throw new Error('[mnapp-firebase-firestore] afterLoad failed to execute.', {
                  cause: error,
                });
              });
          } else {
            completeLoading(data);
          }
        } else {
          if (realtimeDoc.doc) {
            deleted && deleted();
            onDocDelete(id);
          } else {
            notFound && notFound();
          }

          realtimeDoc.unsubscribe();
          delete realtimeDocs[docKey];
        }

        function completeLoading(docAm: TAm) {
          const idMap = new Map([[docAm, id]]);
          const extraArgs = () => ({ idMap });
          const docM = mapper.map<TAm, T>(docAm, apiModelName, modelName, {
            extraArgs,
          });
          realtimeDoc.doc = docM;

          done();

          if (firstSnapshot) {
            firstSnapshot = false;
          } else {
            void onDocUpdate(id);
          }
        }
      },
      // onError
      (err) => {
        error && error(err);
      },
    );

    realtimeDocs[docKey] = {
      unsubscribe,
    };
  }

  async function getNewDoc(docRef: DocumentReference<TAm>) {
    const autoGeneratedFields = options.autoGeneratedFields;

    if (autoGeneratedFields && autoGeneratedFields.length > 0) {
      return new Promise<TAm | undefined>((resolve) => {
        const unsubscribe = onSnapshot(
          docRef,
          // onNext
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const newDoc = docSnapshot.data();

              if (!autoGeneratedFields.map((value) => !!newDoc[value]).includes(false)) {
                unsubscribe();

                if (options.afterLoad) {
                  options.afterLoad(newDoc).then(
                    () => {
                      resolve(newDoc);
                    },
                    () => {
                      throw new Error('[mnapp-firebase-firestore] afterLoad failed to execute.');
                    },
                  );
                } else {
                  resolve(newDoc);
                }
              }
            } else {
              unsubscribe();
              resolve(undefined);
            }
          },
          // onError
          (err) => {
            console.error(err);
            unsubscribe();
            resolve(undefined);
          },
        );
      });
    } else {
      const newDoc = (await getDoc(docRef)).data();

      newDoc && options.afterLoad && (await options.afterLoad(newDoc));

      return newDoc;
    }
  }
}

export default buildActions;
