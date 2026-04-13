import { computed } from 'vue';

import { useProjectViewPage } from './useProjectEditPage.js';

type Props = {
  scopeName: string;
  itemIndex: number;
};

export default function useItemEditor(props: Readonly<Props>) {
  // Composables

  const $p = useProjectViewPage(props.scopeName);

  // Computed

  const item = computed(
    () =>
      $p.vm.value.items[props.itemIndex] ||
      (() => {
        throw new Error('[production-projects] Index out of range');
      })(),
  );

  // Methods

  function onUpdateProductType() {
    item.value.contributions.forEach((_value, index) =>
      $p.updateItemContribution(props.itemIndex, index),
    );
  }

  return {
    ...$p,
    item,
    onUpdateProductType,
  };
}
