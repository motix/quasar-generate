import { ref } from 'vue';

export default function useNavigateToNewPage() {
  // Data

  const newUrl = ref<string | null>(null);
  const newButton = ref(true);

  return {
    newUrl,
    newButton,
  };
}
