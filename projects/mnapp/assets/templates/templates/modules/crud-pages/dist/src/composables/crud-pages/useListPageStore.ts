import { createMapper } from '@automapper/core';
import { pojos } from '@automapper/pojos';

import { onActivated, onMounted, onUnmounted } from 'vue';

import type { DocModel } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';

import type { ListPage } from './useListPage/index.js';

class UseStoreHelper<T extends DocModel> {
  Return = useStore<T, never, never>(
    '',
    '',
    createMapper({
      strategyInitializer: pojos(),
    }),
    '',
    '',
    '',
  );
}

type StoreType<T extends DocModel> = Pick<
  ReturnType<UseStoreHelper<T>['Return']>,
  | 'recentlyAddedDocs'
  | 'recentlyUpdatedDocs'
  | 'recentlyDeletedDocs'
  | 'docPage'
  | 'loadDocsPage'
  | 'releaseDocs'
>;

export default function useListPageStore<T extends DocModel>(
  store: StoreType<T>,
  loadPage: ListPage<never, never>['loadPage'],
  appendItems: ListPage<T, never>['appendItems'],
  updateItems: ListPage<T, never>['updateItems'],
  loadOnMounted?: {
    ready: ListPage<never, never>['ready'];
    loadFirstPage: ListPage<never, never>['loadFirstPage'];
    resetItems: ListPage<T, never>['resetItems'];
  },
) {
  // Methods

  function onLoadNextPage(index: number, done: (stop: boolean) => void) {
    void loadPage(
      (payload) => store.loadDocsPage(payload),
      index,
      // done
      (stop) => {
        appendItems(store.docPage(index) as T[]);
        done(stop);
      },
    );
  }

  // Lifecycle Hooks

  if (loadOnMounted) {
    onMounted(() => {
      void loadOnMounted.loadFirstPage(
        (payload) => store.loadDocsPage(payload),
        // done
        () => {
          loadOnMounted.resetItems(store.docPage(0) as T[]);
          loadOnMounted.ready.value = true;
        },
      );
    });
  }

  onActivated(() => {
    updateItems(
      store.recentlyAddedDocs as T[],
      store.recentlyUpdatedDocs as T[],
      store.recentlyDeletedDocs,
    );
  });

  onUnmounted(() => {
    store.releaseDocs({ immediately: false });
  });

  return {
    store,
    onLoadNextPage,
  };
}
