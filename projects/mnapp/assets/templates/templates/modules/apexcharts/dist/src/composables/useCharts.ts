import { computed, reactive } from 'vue';

const data = reactive({
  isChartsView: false,
});

export default function useCharts() {
  // Computed

  const isChartsView = computed({
    get: () => data.isChartsView,
    set: (value) => (data.isChartsView = value),
  });

  return {
    isChartsView,
  };
}
