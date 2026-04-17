import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Dialog, Notify } from 'quasar';

import type {
  LoadRealtimeDocActionPayload,
  LoadRealtimeDocActionResult,
  UpdateDocActionPayload,
} from 'stores/firebase-firestore/index.js';

import type { NewPage } from 'composables/crud-pages/useNewPage/index.js';
import useNotifications from 'composables/useNotifications.js';

export default function useNewChildPage<
  TChildVm extends NonNullable<unknown>,
  TParentVm extends NonNullable<unknown>,
>($p: NewPage<TChildVm, NonNullable<unknown>>) {
  // Private

  const router = useRouter();
  const route = useRoute();

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  // Data

  const muteRealtimeUpdate = ref(false);
  const parentFindKey = ref(((route.params.parentFindKey as string) || '').replaceAll('_', '.'));
  const parentModelFindKeyField = ref<Extract<keyof TParentVm, string>>(
    'id' as Extract<keyof TParentVm, string>,
  ) as Ref<Extract<keyof TParentVm, string>>;
  const parentDocKey = ref<string | null>(null);
  const parentViewModel = ref(null) as Ref<TParentVm | null>;

  // Method Refs

  const parentViewModelGetter = ref<((parentDocKey: string) => TParentVm | null) | null>(null);
  const releaseParentModel = ref<(() => void) | null>(null);
  const addChild = ref<((child: TChildVm) => void) | null>(null);
  const updateParentModel = ref<
    ((payload: UpdateDocActionPayload<TParentVm>) => Promise<void>) | null
  >(null);

  // Computed

  const pvm = computed(
    () =>
      parentViewModel.value ||
      (() => {
        throw new Error('[mnapp-crud-pages] parentViewModel not ready');
      })(),
  );

  // Private Executions

  // usePageData
  $p.createModel.value = async (payload) => {
    parentDocKey.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] parentDocKey not specified');
      })();
    addChild.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] addChild not specified');
      })();
    updateParentModel.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] updateParentModel not specified');
      })();

    addChild.value(payload.doc);

    muteRealtimeUpdate.value = true;

    try {
      await updateParentModel.value({
        docKey: parentDocKey.value,
        doc: pvm.value,
        isViewModel: true,
      });
    } catch (error) {
      muteRealtimeUpdate.value = false;

      throw error;
    }

    return payload.doc;
  };

  // Methods

  function loadParentModel(
    loadParentModel: (payload: LoadRealtimeDocActionPayload) => LoadRealtimeDocActionResult,
  ) {
    return new Promise<void>((resolve) => {
      let resolveOnce: typeof resolve | null = resolve;

      const payload: LoadRealtimeDocActionPayload = {
        findKey: parentFindKey.value,
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

          if (!parentViewModel.value) {
            getParentViewModel();
          } else {
            getParentViewModel();
            notifyRefreshDataSuccessIfNotMuted();
          }

          resolveOnce && resolveOnce();
          resolveOnce = null;
        },
        notFound: () => {
          void router.replace('/ErrorNotFound');
        },
        deleted: () => {
          Dialog.create({
            title: 'Deleted',
            message: "This page's data is deleted. You will be redireted to previous page.",
            persistent: true,
            ok: {
              color: 'primary',
            },
          }).onOk(() => {
            $p.isDirty.value = false;
            $p.confirmAndGoBack();
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
      if (parentModelFindKeyField.value !== 'id') {
        payload.findKeyField = parentModelFindKeyField.value;
      }

      try {
        const result = loadParentModel(payload);
        parentDocKey.value = result.docKey;
        releaseParentModel.value = result.release;
      } catch (error) {
        console.error(error);
        notifyErrorDebug(error);
      }
    });
  }

  function getParentViewModel() {
    parentDocKey.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] parentDocKey not specified');
      })();
    parentViewModelGetter.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] parentViewModelGetter not specified');
      })();

    parentViewModel.value = parentViewModelGetter.value(parentDocKey.value);

    if (parentViewModel.value !== null) {
      // Update parentFindKey and path if changed
      parentFindKey.value = String(parentViewModel.value[parentModelFindKeyField.value]);
    }
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

  // Watch

  watch(parentFindKey, async (value, oldValue) => {
    if (value !== oldValue && !!value && !!oldValue) {
      await updatePath(oldValue, value);
    }
  });

  return {
    parentFindKey,
    parentModelFindKeyField,
    parentDocKey,
    parentViewModel,
    pvm,
    parentViewModelGetter,
    releaseParentModel,
    addChild,
    updateParentModel,
    loadParentModel,
    getParentViewModel,
    updatePath,
  };
}

class UseNewChildPageHelper<
  TChildVm extends NonNullable<unknown>,
  TParentVm extends NonNullable<unknown>,
> {
  Return = useNewChildPage<TChildVm, TParentVm>({} as NewPage<TChildVm, NonNullable<unknown>>);
}

export type NewChildPage<
  TChildVm extends NonNullable<unknown>,
  TParentVm extends NonNullable<unknown>,
> = UseNewChildPageHelper<TChildVm, TParentVm>['Return'];
