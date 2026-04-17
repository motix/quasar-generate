import { createMapper } from '@automapper/core';
import { pojos } from '@automapper/pojos';

import { onMounted, onUnmounted, ref, watch } from 'vue';

import type { DocModel } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';
import type { LoadAllDocsActionPayload } from 'stores/firebase-firestore/types.js';

import useNotifications from 'composables/useNotifications.js';

import type { ViewPage } from './useViewPage/index.js';

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
  'loadAllDocs' | 'releaseDocs'
>;

// useNewPage or useViewPage that doesn't need to wait for switching to editMode | useViewPage that needs to wait for switching to editMode
export default function useEditorDependencies(
  editMode: undefined | ViewPage<never, never>['editMode'],
) {
  // Private

  let dependenciesLoading: number;

  function onDependenciesLoaded() {
    if (dependenciesLoading > 0) {
      return;
    }

    editorReady.value = true;
  }

  // Composables

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  // Data

  const editorReady = ref(false);
  const editorDependenciesStores = ref<
    {
      store: StoreType<never>;
      payload: Partial<LoadAllDocsActionPayload>;
    }[]
  >([]);

  // Private Executions

  // useNewPage or useViewPage that doesn't need to wait for switching to editMode
  if (!editMode) {
    onMounted(() => {
      loadEditorDepencencies();
    });

    onUnmounted(() => {
      releaseEditorDependencies();
    });
  }

  // Methods

  function loadEditorDepencencies() {
    dependenciesLoading = editorDependenciesStores.value.length;

    // Set editorReady if dependenciesStores is empty
    onDependenciesLoaded();

    editorDependenciesStores.value.forEach((value) => {
      value.store
        .loadAllDocs({ queryConstraints: value.payload.queryConstraints || [] })
        .then(() => {
          dependenciesLoading--;
          onDependenciesLoaded();
        })
        .catch((error) => {
          console.error(error);
          notifyLoadDataError();
          notifyErrorDebug(error);
          editorReady.value = true;
        });
    });
  }

  function releaseEditorDependencies() {
    editorDependenciesStores.value.forEach((value) =>
      value.store.releaseDocs({ immediately: false }),
    );
  }

  // Watch

  // useViewPage that needs to wait for switching to editMode
  if (editMode) {
    watch(editMode, (newValue) => {
      editorReady.value = false;

      if (newValue) {
        loadEditorDepencencies();
      } else {
        releaseEditorDependencies();
      }
    });
  }

  return {
    editorReady,
    editorDependenciesStores,
    loadEditorDepencencies,
    releaseEditorDependencies,
  };
}
