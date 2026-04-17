import { readonly, ref } from 'vue';

import { requiredConfigEntries } from 'composables/useConfig.js';

export default function useCardsView() {
  // Composables

  const listItemCardWidth = readonly(
    ref(requiredConfigEntries('listItemCardWidth').listItemCardWidth),
  );

  return {
    listItemCardWidth,
  };
}
