import type { ShallowRef, useTemplateRef } from 'vue';
import { computed, nextTick, ref, watch } from 'vue';

import useNotifications from 'composables/useNotifications.js';

import type StickyHeaders from 'components/shared/StickyHeaders.vue';

import type { EditPage } from './useEditPage.js';
import { extendEditPage } from './useEditPage.js';

// useNewPage | useViewPage
export default function useEditorLiteMode<TVm extends NonNullable<unknown>>(
  $p: EditPage<never, TVm, NonNullable<unknown>>,
  validateFullModeEditor: () => Promise<boolean>,
  validateLiteModeEditor: () => Promise<boolean>,
  resetInputs: () => void,
) {
  // Composables

  const { notifyValidationError } = useNotifications();

  const $ep = extendEditPage($p);

  // Data

  const liteMode = ref(true);
  const showLiteModeInputs = ref(false);
  const stickyHeadersRef =
    ref<
      ReturnType<typeof useTemplateRef<InstanceType<typeof StickyHeaders>>> extends Readonly<
        ShallowRef<infer Component>
      >
        ? Component
        : never
    >(null);

  // Computed

  const showToggleLiteModeButton = computed(() => $p.ready.value && $ep.newPageOrEditMode.value);

  // Methods

  async function toggleLiteMode() {
    if (liteMode.value) {
      liteMode.value = !liteMode.value;
    } else {
      if (await validateFullModeEditor()) {
        liteMode.value = !liteMode.value;
      } else {
        notifyValidationError();
      }
    }
  }

  async function onLiteModeViewerClick(assignValues: () => void) {
    if (await validateLiteModeEditor()) {
      assignValues();

      $p.dirty();
      void nextTick(() => stickyHeadersRef.value?.update());
    } else {
      showLiteModeInputs.value = true;
    }
  }

  // Watch

  if ($ep.editMode) {
    watch($ep.editMode, () => {
      liteMode.value = true;
      showLiteModeInputs.value = false;
      resetInputs();
    });
  }

  return {
    liteMode,
    showLiteModeInputs,
    stickyHeadersRef,
    showToggleLiteModeButton,
    toggleLiteMode,
    onLiteModeViewerClick,
  };
}
