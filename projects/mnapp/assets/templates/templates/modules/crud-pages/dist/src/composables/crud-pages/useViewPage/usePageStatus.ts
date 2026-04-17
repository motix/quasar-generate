import { ref } from 'vue';

export default function usePageStatus() {
  // Data

  const ready = ref(false);
  const freezed = ref(false);
  const muteRealtimeUpdate = ref(false);
  const delayRealtimeUpdate = ref(false);
  const ignoreViewerWatch = ref(false);
  const editMode = ref(false);
  const readonlyMode = ref(false);
  const isDirty = ref(false);

  // Methods

  function dirty() {
    isDirty.value = true;
  }

  return {
    ready,
    freezed,
    muteRealtimeUpdate,
    delayRealtimeUpdate,
    ignoreViewerWatch,
    editMode,
    readonlyMode,
    isDirty,
    dirty,
  };
}
