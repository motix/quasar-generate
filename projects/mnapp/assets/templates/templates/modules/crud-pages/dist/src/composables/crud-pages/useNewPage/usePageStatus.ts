import { ref } from 'vue';

export default function usePageStatus() {
  // Data

  const ready = ref(false);
  const freezed = ref(false);
  const isDirty = ref(false);

  // Methods

  function dirty() {
    isDirty.value = true;
  }

  return {
    ready,
    freezed,
    isDirty,
    dirty,
  };
}
