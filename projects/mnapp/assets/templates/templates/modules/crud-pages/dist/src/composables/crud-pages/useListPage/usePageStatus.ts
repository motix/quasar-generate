import { ref } from 'vue';

export default function usePageStatus() {
  // Data

  const ready = ref(false);

  return {
    ready,
  };
}
