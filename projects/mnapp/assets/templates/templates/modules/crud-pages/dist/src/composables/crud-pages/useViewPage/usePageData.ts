import type { Ref } from 'vue';
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Dialog, Notify } from 'quasar';

import type {
  DeleteDocActionPayload,
  LoadRealtimeDocActionPayload,
  LoadRealtimeDocActionResult,
  UpdateDocActionPayload,
} from 'stores/firebase-firestore/index.js';

import useNotifications from 'composables/useNotifications.js';
import type useReturnUrl from 'composables/useReturnUrl.js';

import type usePageFeatures from './usePageFeatures.js';
import type usePageStatus from './usePageStatus.js';

export default function usePageData<
  T extends NonNullable<unknown>,
  TVm extends NonNullable<unknown>,
>(
  goBack: ReturnType<typeof useReturnUrl>['goBack'],
  hasEditor: ReturnType<typeof usePageFeatures>['hasEditor'],
  ready: ReturnType<typeof usePageStatus>['ready'],
  muteRealtimeUpdate: ReturnType<typeof usePageStatus>['muteRealtimeUpdate'],
  delayRealtimeUpdate: ReturnType<typeof usePageStatus>['delayRealtimeUpdate'],
  ignoreViewerWatch: ReturnType<typeof usePageStatus>['ignoreViewerWatch'],
  editMode: ReturnType<typeof usePageStatus>['editMode'],
  isDirty: ReturnType<typeof usePageStatus>['isDirty'],
) {
  // Private

  // Use the same method to reload model
  const lastLoadModel = ref<
    ((payload: LoadRealtimeDocActionPayload) => LoadRealtimeDocActionResult) | null
  >(null);

  // Composables

  const router = useRouter();
  const route = useRoute();

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  // Data

  const findKey = ref(((route.params.findKey as string) || '').replaceAll('_', '.'));
  const modelFindKeyField = ref<Extract<keyof T & keyof TVm, string>>(
    'id' as Extract<keyof T & keyof TVm, string>,
  ) as Ref<Extract<keyof T & keyof TVm, string>>;
  const docKey = ref<string | null>(null);
  const model = ref(null) as Ref<T | null>;
  const viewModel = ref(null) as Ref<TVm | null>;
  const reloadDialogShowing = ref(false);

  // Method Refs

  const modelGetter = ref<((docKey: string, realtimeUpdate: boolean) => T | null) | null>(null);
  const viewModelGetter = ref<((docKey: string, realtimeUpdate: boolean) => TVm | null) | null>(
    null,
  );
  const releaseModel = ref<(() => void) | null>(null);
  const updateModel = ref<((payload: UpdateDocActionPayload<T | TVm>) => Promise<void>) | null>(
    null,
  );
  const deleteModel = ref<((payload: DeleteDocActionPayload) => Promise<void>) | null>(null);

  // Computed

  const m = computed(
    () =>
      model.value ||
      (() => {
        throw new Error('[mnapp-crud-pages] model not ready');
      })(),
  );

  const vm = computed(
    () =>
      viewModel.value ||
      (() => {
        throw new Error('[mnapp-crud-pages] viewModel not ready');
      })(),
  );

  const activeModelOrViewModel = computed(() => (editMode.value ? viewModel.value : model.value));

  const activeMOrVm = computed(
    () =>
      activeModelOrViewModel.value ||
      (() => {
        throw new Error(`[mnapp-crud-pages] ${editMode.value ? 'viewModel' : 'model'} not ready`);
      })(),
  );

  // Methods

  function loadModel(
    loadModel: (payload: LoadRealtimeDocActionPayload) => LoadRealtimeDocActionResult,
  ) {
    lastLoadModel.value = loadModel;

    return new Promise<void>((resolve) => {
      let resolveOnce: typeof resolve | null = resolve;

      const payload: LoadRealtimeDocActionPayload = {
        findKey: findKey.value,
        done: () => {
          const notifyRefreshDataSuccessIfNotMuted = () => {
            if (muteRealtimeUpdate.value) {
              muteRealtimeUpdate.value = false;
            } else {
              Notify.create({
                message: 'The page has just been refreshed with latest data.',
                type: 'info',
                actions: [{ icon: 'close', color: 'white' }],
              });
            }
          };

          if (!model.value) {
            getModelAndViewModel(false);
          } else if (delayRealtimeUpdate.value) {
            const stopWatch = watch(delayRealtimeUpdate, () => {
              if (delayRealtimeUpdate.value === false) {
                stopWatch();

                isDirty.value = false;
                getModelAndViewModel(true);
                notifyRefreshDataSuccessIfNotMuted();
              }
            });
          } else if (editMode.value) {
            if (!reloadDialogShowing.value) {
              reloadDialogShowing.value = true;

              Dialog.create({
                title: 'Refresh',
                message: "This page's data has changed. Do you want to refresh?",
                cancel: true,
                persistent: true,
                ok: {
                  color: 'primary',
                },
              })
                .onOk(() => {
                  isDirty.value = false;
                  getModelAndViewModel(true);
                })
                .onDismiss(() => {
                  reloadDialogShowing.value = false;
                });
            }
          } else {
            getModelAndViewModel(true);
            notifyRefreshDataSuccessIfNotMuted();
          }

          resolveOnce && resolveOnce();
          resolveOnce = null;
        },
        notFound: () => {
          void router.replace('/ErrorNotFound');
        },
        deleted: () => {
          !muteRealtimeUpdate.value &&
            Dialog.create({
              title: 'Deleted',
              message: "This page's data is deleted. You will be redireted to previous page.",
              persistent: true,
              ok: {
                color: 'primary',
              },
            }).onOk(() => {
              goBack();
            });
        },
        error: (error) => {
          console.error(error);
          notifyLoadDataError();
          notifyErrorDebug(error);
          resolveOnce && resolveOnce();
          resolveOnce = null;
        },
      };

      // Asuming view model and API model has this same field
      if (modelFindKeyField.value !== 'id') {
        payload.findKeyField = modelFindKeyField.value;
      }

      try {
        const result = loadModel(payload);
        docKey.value = result.docKey;
        releaseModel.value = result.release;
      } catch (error) {
        console.error(error);
        notifyErrorDebug(error);
      }
    });
  }

  async function reloadModel() {
    if (!lastLoadModel.value) {
      return;
    }

    ready.value = false;
    muteRealtimeUpdate.value = true;

    await loadModel(lastLoadModel.value);

    muteRealtimeUpdate.value = false;
    // Wait for loading animation and for all components unmounted
    setTimeout(() => {
      ready.value = true;
    }, 500);
  }

  function getModelAndViewModel(realtimeUpdate: boolean) {
    docKey.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] docKey not specified');
      })();
    modelGetter.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] modelGetter not specified');
      })();

    ignoreViewerWatch.value = true;
    model.value = modelGetter.value(docKey.value, realtimeUpdate);

    if (hasEditor.value) {
      viewModelGetter.value === null &&
        (() => {
          throw new Error('[mnapp-crud-pages] viewModelGetter not specified');
        })();

      viewModel.value = viewModelGetter.value(docKey.value, realtimeUpdate);
    }

    if (model.value !== null) {
      // Update findKey and path if changed
      findKey.value = String(model.value[modelFindKeyField.value]);
    }

    void nextTick(() => {
      ignoreViewerWatch.value = false;
    });
  }

  function updatePath(oldFindKey: string, newFindKey: string) {
    let path = route.fullPath;

    if (path.endsWith(oldFindKey.replaceAll('.', '_'))) {
      path = path.substring(0, path.length - oldFindKey.length) + newFindKey.replaceAll('.', '_');
    } else {
      path = path.replace(
        `/${oldFindKey.replaceAll('.', '_')}/`,
        `/${newFindKey.replaceAll('.', '_')}/`,
      );
    }

    route.meta.replaceRoute = true;
    return router.replace(path);
  }

  function watchFindKey() {
    watch(
      () => route.params.findKey,
      async (newValue, oldValue) => {
        // Only handling cases where model was loaded
        if (newValue === oldValue || !model.value) {
          return;
        }

        // `findKey` param was updated by `updatePath`
        if (((newValue as string) || '').replaceAll('_', '.') === findKey.value) {
          return;
        }

        findKey.value = ((newValue as string) || '').replaceAll('_', '.');

        await reloadModel();
      },
    );
  }

  // Watch

  watch(findKey, async (value, oldValue) => {
    if (value !== oldValue && !!value && !!oldValue) {
      await updatePath(oldValue, value);
    }
  });

  // hasEditor might be specified based on model's data.
  // Get viewModel if not already get.
  watch(hasEditor, () => {
    if (hasEditor.value && model.value && !viewModel.value) {
      viewModelGetter.value === null &&
        (() => {
          throw new Error('[mnapp-crud-pages] viewModelGetter not specified');
        })();
      docKey.value === null &&
        (() => {
          throw new Error('[mnapp-crud-pages] docKey not specified');
        })();

      viewModel.value = viewModelGetter.value(docKey.value, false);
    } else {
      // Clear viewModel so that it will be updated when hasEditor is toggled
      viewModel.value = null;
    }
  });

  return {
    findKey,
    modelFindKeyField,
    docKey,
    model,
    viewModel,
    reloadDialogShowing,
    modelGetter,
    viewModelGetter,
    releaseModel,
    updateModel,
    deleteModel,
    m,
    vm,
    activeModelOrViewModel,
    activeMOrVm,
    loadModel,
    reloadModel,
    getModelAndViewModel,
    updatePath,
    watchFindKey,
  };
}

export class UsePageDataHelper<T extends NonNullable<unknown>, TVm extends NonNullable<unknown>> {
  Return = usePageData<T, TVm>(
    () => undefined,
    ref(false),
    ref(false),
    ref(false),
    ref(false),
    ref(false),
    ref(false),
    ref(false),
  );
}
