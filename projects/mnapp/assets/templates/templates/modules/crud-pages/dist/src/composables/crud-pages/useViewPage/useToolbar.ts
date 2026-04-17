import type { ShallowRef, useTemplateRef } from 'vue';
import { computed, ref } from 'vue';

import type FloatToolbar from 'components/shared/FloatToolbar.vue';

import type usePageFeatures from './usePageFeatures';
import type usePageStatus from './usePageStatus';

export default function useToolbar(
  hasEditor: ReturnType<typeof usePageFeatures>['hasEditor'],
  hasDeleting: ReturnType<typeof usePageFeatures>['hasDeleting'],
  hasMultiViews: ReturnType<typeof usePageFeatures>['hasMultiViews'],
  ready: ReturnType<typeof usePageStatus>['ready'],
  editMode: ReturnType<typeof usePageStatus>['editMode'],
) {
  // Data

  const toolbarRef =
    ref<
      ReturnType<typeof useTemplateRef<InstanceType<typeof FloatToolbar>>> extends Readonly<
        ShallowRef<infer Component>
      >
        ? Component
        : never
    >(null);
  const toolbarPersistent = ref(false);
  const toolbarMainButtonVisibility = ref<Record<string, boolean>>({});
  const toolbarExtraButtonVisibility = ref<Record<string, boolean>>({});
  const toolbarSecondRowButtonVisibility = ref<Record<string, boolean>>({});

  // Computed

  const toolbarFabButtonsVisibility = computed(() => ({
    edit: hasEditor.value && ready.value && !editMode.value,
    revert: editMode.value,
    save: editMode.value,
    trash: hasDeleting.value && ready.value,
    switchView: hasMultiViews.value,
    ...toolbarMainButtonVisibility.value,
    ...toolbarExtraButtonVisibility.value,
    ...toolbarSecondRowButtonVisibility.value,
  }));

  const toolbarFixedButtonsVisibility = computed(() => ({
    back: !editMode.value,
  }));

  // Methods

  function openToolbar() {
    toolbarRef.value?.open();
  }

  return {
    toolbarRef,
    toolbarPersistent,
    toolbarMainButtonVisibility,
    toolbarExtraButtonVisibility,
    toolbarSecondRowButtonVisibility,
    toolbarFabButtonsVisibility,
    toolbarFixedButtonsVisibility,
    openToolbar,
  };
}
