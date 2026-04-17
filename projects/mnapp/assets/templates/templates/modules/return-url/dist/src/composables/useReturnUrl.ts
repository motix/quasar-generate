import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

export default function () {
  // Composables

  const router = useRouter();
  const { meta } = useRoute();

  // Data

  const defaultReturnUrl = ref('');

  // Computed

  const returnUrl = computed(() => (meta.history && meta.history[0]) || defaultReturnUrl.value);

  // Methods

  function goBack() {
    onGoBack();
    void router.push(returnUrl.value);
  }

  function onGoBack() {
    meta.goingBack = true;
  }

  return {
    defaultReturnUrl,
    returnUrl,
    goBack,
    onGoBack,
  };
}
