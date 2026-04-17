import { ref } from 'vue';

export default function usePageFeatures() {
  // Data

  const hasEditor = ref(true);
  const hasDeleting = ref(true);
  const hasMultiViews = ref(false);

  return {
    hasEditor,
    hasDeleting,
    hasMultiViews,
  };
}
