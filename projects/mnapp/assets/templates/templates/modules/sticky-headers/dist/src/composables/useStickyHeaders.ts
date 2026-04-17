import type { Ref } from 'vue';
import { computed, inject, provide, ref } from 'vue';

const StickyHeadersResultSymbol = Symbol('stickyHeadersResult');

export interface StickyHeadersResult {
  readonly revealed: Readonly<Ref<boolean>>;
  readonly fixedHeaderHeight: Readonly<Ref<number>>;
  readonly stickyHeadersPosition: Readonly<Ref<number>>;
}

export default function (fixedHeaderHeight: number) {
  // Data

  const revealed = ref(true);

  // Computed

  const readOnlyRevealed = computed(() => revealed.value);
  const readOnlyFixedHeaderHeight = computed(() => fixedHeaderHeight);
  const stickyHeadersPosition = computed(() => (revealed.value ? fixedHeaderHeight : 0));

  const result: StickyHeadersResult = {
    revealed: readOnlyRevealed,
    fixedHeaderHeight: readOnlyFixedHeaderHeight,
    stickyHeadersPosition,
  };

  // Private Executions

  provide(StickyHeadersResultSymbol, result);

  // Methods

  function onReveal(value: boolean) {
    revealed.value = value;
  }

  return {
    ...result,
    onReveal,
  };
}

export function useStickyHeadersResult() {
  const stickyHeadersResult = inject<StickyHeadersResult>(StickyHeadersResultSymbol);
  !stickyHeadersResult &&
    (() => {
      throw new Error('[mnapp-sticky-headers] No sticky header result provided.');
    })();

  return stickyHeadersResult;
}
