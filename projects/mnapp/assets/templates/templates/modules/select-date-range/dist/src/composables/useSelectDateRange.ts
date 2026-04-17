import { computed } from 'vue';

import { range } from 'lodash-es';

import { requiredConfigEntries } from 'composables/useConfig.js';

export default function useSelectDateRange() {
  // Private

  const { firstYear } = requiredConfigEntries('firstYear');

  // Computed

  const yearOptions = computed(() => range(new Date().getFullYear() + 1, firstYear - 1));
  const monthOptions = computed(() => range(1, 13));

  return {
    yearOptions,
    monthOptions,
  };
}
