import type { ComponentPublicInstance, Ref } from 'vue';
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Dialog, Platform } from 'quasar';

import type { UpdateDocActionPayload } from 'stores/firebase-firestore/index.js';

import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useNotifications from 'composables/useNotifications.js';
import useScroll from 'composables/useScroll.js';

export default function useViewChildPage<
  TChild extends NonNullable<unknown>,
  TChildVm extends NonNullable<unknown>,
  TParent extends NonNullable<unknown>,
  TParentVm extends NonNullable<unknown>,
>($p: ViewPage<TChild, TChildVm, NonNullable<unknown>>) {
  // Private

  const route = useRoute();
  const router = useRouter();

  const { notifyErrorDebug, notifySaveDataSuccess, notifySaveDataError } = useNotifications();

  const { toTop: scrollToTop, toElement: scrollToElement } = useScroll();

  // Data

  const hasChildDeleting = ref(true);
  // Used as a secondary findKey
  const childListKey = ref<string | null>(null);
  const parentFindKey = ref(((route.params.parentFindKey as string) || '').replaceAll('_', '.'));
  const parentModelFindKeyField = ref<Extract<keyof TParent & keyof TParentVm, string>>(
    'id' as Extract<keyof TParent & keyof TParentVm, string>,
  ) as Ref<Extract<keyof TParent & keyof TParentVm, string>>;
  const parentModel = ref(null) as Ref<TParent | null>;
  const parentViewModel = ref(null) as Ref<TParentVm | null>;
  const disableChildPageSwitching = ref(false);
  const viewUrl = ref<string | null>(null);
  const childViewerRef = ref<ComponentPublicInstance | null>(null);

  // Method Refs

  const parentModelGetter = ref<((docKey: string) => TParent | null) | null>(null);
  const parentViewModelGetter = ref<((docKey: string) => TParentVm | null) | null>(null);
  const modelChildrenGetter = ref<((parentModel: TParent) => TChild[]) | null>(null);
  const viewModelChildrenGetter = ref<((parentViewModel: TParentVm) => TChildVm[]) | null>(null);
  const removeChild = ref<((child: TChild) => void) | null>(null);
  const selectNextChildAfterRemoving = ref<((children: TChild[]) => TChild) | null>(null);
  const updateParentModel = ref<
    ((payload: UpdateDocActionPayload<TParent | TParentVm>) => Promise<void>) | null
  >(null);

  // Computed

  const pm = computed(
    () =>
      parentModel.value ||
      (() => {
        throw new Error('[mnapp-crud-pages] parentModel not ready');
      })(),
  );
  const pvm = computed(
    () =>
      parentViewModel.value ||
      (() => {
        throw new Error('[mnapp-crud-pages] parentViewModel not ready');
      })(),
  );

  const findKeyOptions = computed(() =>
    modelChildrenGetter.value && parentModel.value
      ? modelChildrenGetter.value(parentModel.value).map((value) => ({
          value: String(value[$p.modelFindKeyField.value]),
          slot: String(value[$p.modelFindKeyField.value]),
          data: value,
        })) || []
      : [],
  );

  const showDeleteButton = computed(() => hasChildDeleting.value && !!$p.model.value);

  // Private Executions

  // usePageData
  $p.modelGetter.value = (docKey, realtimeUpdate) => {
    parentModelGetter.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] parentModelGetter not specified');
      })();
    modelChildrenGetter.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] modelChildrenGetter not specified');
      })();

    parentModel.value = parentModelGetter.value(docKey);

    if (parentModel.value === null) {
      return null;
    }

    // Update parentFindKey and path if changed
    parentFindKey.value = String(parentModel.value[parentModelFindKeyField.value]);

    const children = modelChildrenGetter.value(parentModel.value);

    if (children.length === 0) {
      realtimeUpdate &&
        Dialog.create({
          title: 'Deleted',
          message: "This page's data is deleted. You will be redireted to previous page.",
          persistent: true,
          ok: {
            color: 'primary',
          },
        }).onOk(() => {
          $p.goBack();
        });

      return null;
    }

    if (!$p.findKey.value) {
      $p.findKey.value = String(children[children.length - 1]![$p.modelFindKeyField.value]);
    }

    let child = children.find(
      (value) => String(value[$p.modelFindKeyField.value]) === $p.findKey.value,
    );

    // Supports retreiving the model even when its key was changed
    if (child) {
      childListKey.value = (child as { listKey?: string }).listKey || null;
    } else if (realtimeUpdate && !!childListKey.value) {
      child = children.find(
        (value) => (value as { listKey?: string }).listKey === childListKey.value,
      );

      if (child) {
        $p.findKey.value = String(child[$p.modelFindKeyField.value]);
      }
    }

    !child &&
      realtimeUpdate &&
      Dialog.create({
        title: 'Deleted',
        message: "This page's data is deleted. You will be redireted to previous page.",
        persistent: true,
        ok: {
          color: 'primary',
        },
      }).onOk(() => {
        $p.goBack();
      });

    return child || null;
  };
  $p.viewModelGetter.value = (docKey) => {
    parentViewModelGetter.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] parentViewModelGetter not specified');
      })();
    viewModelChildrenGetter.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] viewModelChildrenGetter not specified');
      })();

    parentViewModel.value = parentViewModelGetter.value(docKey);

    if (parentViewModel.value === null) {
      return null;
    }

    const children = viewModelChildrenGetter.value(parentViewModel.value);

    if (children.length === 0) {
      return null;
    }

    return (
      children.find((value) => String(value[$p.modelFindKeyField.value]) === $p.findKey.value) ||
      null
    );
  };
  $p.updateModel.value = (payload) => {
    updateParentModel.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] updateParentModel not specified');
      })();

    return updateParentModel.value({
      docKey: payload.docKey,
      doc: payload.isViewModel ? pvm.value : pm.value,
      isViewModel: payload.isViewModel,
    });
  };

  // Methods

  function deleteChild() {
    Dialog.create({
      title: 'Delete',
      message: 'Are you sure want to delete the information?',
      cancel: true,
      persistent: true,
    }).onOk(() => {
      $p.docKey.value === null &&
        (() => {
          throw new Error('[mnapp-crud-pages] docKey not specified');
        })();
      modelChildrenGetter.value === null &&
        (() => {
          throw new Error('[mnapp-crud-pages] modelChildrenGetter not specified');
        })();
      updateParentModel.value === null &&
        (() => {
          throw new Error('[mnapp-crud-pages] updateParentModel not specified');
        })();

      $p.freezed.value = true;
      $p.muteRealtimeUpdate.value = true;
      $p.deleting.value = true;

      const model = $p.m.value;
      let children = modelChildrenGetter.value(pm.value);

      $p.exitEditMode();

      if (removeChild.value) {
        removeChild.value(model);
      } else {
        children.splice(children.indexOf(model), 1);
      }

      children = modelChildrenGetter.value(pm.value);

      if (children.length > 0) {
        $p.findKey.value = $p.findKey.value = String(
          (selectNextChildAfterRemoving.value
            ? selectNextChildAfterRemoving.value(children)
            : children[children.length - 1]!)[$p.modelFindKeyField.value],
        );
      }

      updateParentModel
        .value({
          docKey: $p.docKey.value,
          doc: pm.value,
          isViewModel: false,
        })
        .then(() => {
          modelChildrenGetter.value === null &&
            (() => {
              throw new Error('[mnapp-crud-pages] modelChildrenGetter not specified');
            })();

          notifySaveDataSuccess();
          $p.deleting.value = false;

          if (modelChildrenGetter.value(pm.value).length === 0) {
            $p.goBack();
          } else {
            $p.freezed.value = false;
          }
        })
        .catch((error: Error) => {
          console.error(error);
          notifySaveDataError();
          notifyErrorDebug(error);

          $p.deleting.value = false;
          $p.muteRealtimeUpdate.value = false;
          $p.freezed.value = false;
        });
    });
  }

  function watchParentFindKey() {
    watch(
      () => route.params.parentFindKey,
      async (newValue, oldValue) => {
        // Only handling cases where model was loaded
        if (newValue === oldValue || !$p.model.value) {
          return;
        }

        // `parentFindKey` param was updated by `updatePath`
        if (((newValue as string) || '').replaceAll('_', '.') === parentFindKey.value) {
          return;
        }

        disableChildPageSwitching.value = true;

        $p.findKey.value = ((route.params.findKey as string) || '').replaceAll('_', '.');
        parentFindKey.value = ((newValue as string) || '').replaceAll('_', '.');

        await $p.reloadModel();

        disableChildPageSwitching.value = false;
      },
    );
  }

  // Watch

  watch($p.findKey, (value, oldValue) => {
    viewUrl.value === null &&
      (() => {
        throw new Error('[mnapp-crud-pages] viewUrl not specified');
      })();

    if (disableChildPageSwitching.value) {
      return;
    }

    if (oldValue === '') {
      route.meta.replaceRoute = true;
      void router.replace(
        `${viewUrl.value}${parentFindKey.value.replaceAll('.', '_')}/${value.replaceAll('.', '_')}`,
      );
    }

    $p.getModelAndViewModel(false);

    if (Platform.is.mobile) {
      void nextTick(() => {
        if (childViewerRef.value) {
          scrollToElement(childViewerRef.value);
        } else {
          scrollToTop();
        }
      });
    } else {
      scrollToTop();
    }
  });

  watch(parentFindKey, async (value, oldValue) => {
    if (value !== oldValue && !!value && !!oldValue) {
      await $p.updatePath(oldValue, value);
    }
  });

  watchEffect(() => {
    $p.toolbarMainButtonVisibility.value.delete = showDeleteButton.value;
  });

  return {
    hasChildDeleting,
    childListKey,
    parentFindKey,
    parentModelFindKeyField,
    parentModel,
    parentViewModel,
    disableChildPageSwitching,
    viewUrl,
    childViewerRef,
    pm,
    pvm,
    findKeyOptions,
    parentModelGetter,
    parentViewModelGetter,
    modelChildrenGetter,
    viewModelChildrenGetter,
    removeChild,
    selectNextChildAfterRemoving,
    updateParentModel,
    showDeleteButton,
    deleteChild,
    watchParentFindKey,
  };
}

class UseViewChildPageHelper<
  TChild extends NonNullable<unknown>,
  TChildVm extends NonNullable<unknown>,
  TParent extends NonNullable<unknown>,
  TParentVm extends NonNullable<unknown>,
> {
  Return = useViewChildPage<TChild, TChildVm, TParent, TParentVm>(
    {} as ViewPage<TChild, TChildVm, NonNullable<unknown>>,
  );
}

export type ViewChildPage<
  TChild extends NonNullable<unknown>,
  TChildVm extends NonNullable<unknown>,
  TParent extends NonNullable<unknown>,
  TParentVm extends NonNullable<unknown>,
> = UseViewChildPageHelper<TChild, TChildVm, TParent, TParentVm>['Return'];
