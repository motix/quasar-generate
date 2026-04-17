import { computed, reactive } from 'vue';

import { Platform } from 'quasar';

import useScroll from 'composables/useScroll.js';

const data = reactive({
  viewType: Platform.is.desktop ? 'table' : ('cards' as 'table' | 'cards'),
});

export default function () {
  // Composables

  const scroll = useScroll();

  // Computed

  const isTableView = computed(() => data.viewType === 'table');
  const isCardsView = computed(() => data.viewType === 'cards');

  // Methods

  function switchView() {
    switch (data.viewType) {
      case 'table':
        data.viewType = 'cards';
        break;
      case 'cards':
        data.viewType = 'table';
        break;
      default:
        throw new Error(`[mnapp-multi-views] viewType '${String(data.viewType)}' not implemented`);
    }
  }

  function switchViewAndScroll() {
    switchView();
    scroll.toTop();
  }

  return {
    isTableView,
    isCardsView,
    switchView,
    switchViewAndScroll,
  };
}
