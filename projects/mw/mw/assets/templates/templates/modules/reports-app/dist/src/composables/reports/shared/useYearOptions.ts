import type { Ref } from 'vue';
import { ref, watch } from 'vue';

import { date } from 'quasar';

import { requiredConfigEntries } from 'composables/useConfig.js';
import useSelectDateRange from 'composables/useSelectDateRange.js';

export default function useYearOptions(
  startDate: Ref<string>,
  endDate: Ref<string>,
  loadReport: () => Promise<void>,
  initialYear: number | null,
) {
  // Private

  const { editDateFormat } = requiredConfigEntries('editDateFormat');
  const years = useSelectDateRange().yearOptions.value;
  const firstDate = date.formatDate(new Date(years[years.length - 1]!, 0, 1), editDateFormat);
  const lastDate = date.formatDate(
    new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
    editDateFormat,
  );

  function updateYear() {
    const startDateValue = date.extractDate(startDate.value, editDateFormat);
    const endDateValue = date.extractDate(endDate.value, editDateFormat);

    if (startDate.value === firstDate && endDate.value === lastDate) {
      year.value = 0;
    } else if (
      startDateValue.getFullYear() === endDateValue.getFullYear() &&
      startDateValue.getDate() === 1 &&
      startDateValue.getMonth() === 0 &&
      endDateValue.getDate() === 31 &&
      endDateValue.getMonth() === 11
    ) {
      year.value = startDateValue.getFullYear();
    }
  }

  // Data

  const year = ref<number | null>(initialYear);
  const yearOptions = ref([
    ...years.map((value) => ({
      label: String(value),
      value: value,
    })),
    {
      label: 'All',
      value: 0,
    },
  ]);

  // Watch

  watch(year, (value, oldValue) => {
    if (value !== oldValue && value !== null) {
      const oldStartDate = startDate.value;
      const oldEndDate = endDate.value;

      if (value === 0) {
        startDate.value = firstDate;
        endDate.value = lastDate;
      } else {
        startDate.value = date.formatDate(new Date(value, 0, 1), editDateFormat);
        endDate.value = date.formatDate(new Date(value, 11, 31), editDateFormat);
      }

      if (startDate.value !== oldStartDate || endDate.value !== oldEndDate) {
        void loadReport();
      }
    }
  });

  watch(startDate, (value) => {
    if (
      year.value !== null &&
      value !== date.formatDate(new Date(year.value, 0, 1), editDateFormat)
    ) {
      year.value = null;
    } else {
      updateYear();
    }
  });

  watch(endDate, (value) => {
    if (
      year.value !== null &&
      value !== date.formatDate(new Date(year.value, 11, 31), editDateFormat)
    ) {
      year.value = null;
    } else {
      updateYear();
    }
  });

  return {
    year,
    yearOptions,
  };
}
