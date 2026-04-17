import type { Ref } from 'vue';
import { computed, inject, provide, ref } from 'vue';

const QFAB_BTN_SIZE = 56;

const FloatToolbarResultSymbol = Symbol('floatToolbarResult');

export interface FloatToolbarResult {
  readonly revealed: Readonly<Ref<boolean>>;
  readonly fixedHeaderHeight: Readonly<Ref<number>>;
  readonly collapseHeaderHeight: Readonly<Ref<number>>;
  readonly headerHeight: Readonly<Ref<number>>;
  readonly headerElevated: Readonly<Ref<boolean>>;
  readonly floatToolbarOffsetTop: Readonly<Ref<number>>;
  readonly floatToolbarOffsetBottom: Readonly<Ref<number>>;
}

export default function (fixedHeaderHeight: number, collapseHeaderHeight: number) {
  // Data

  const revealed = ref(true);

  // Computed

  const readOnlyRevealed = computed(() => revealed.value);
  const readOnlyFixedHeaderHeight = computed(() => fixedHeaderHeight);
  const readOnlyCollapseHeaderHeight = computed(() => collapseHeaderHeight);
  const headerHeight = computed(() => fixedHeaderHeight + collapseHeaderHeight);
  const scrollPosition = ref(0);
  const headerElevated = computed(() => scrollPosition.value >= collapseHeaderHeight);
  const floatToolbarOffsetTop = computed(() =>
    Math.max(collapseHeaderHeight - scrollPosition.value, revealed.value ? 0 : QFAB_BTN_SIZE / 2),
  );
  const floatToolbarOffsetBottom = computed(() => QFAB_BTN_SIZE / 2);

  const result: FloatToolbarResult = {
    revealed: readOnlyRevealed,
    fixedHeaderHeight: readOnlyFixedHeaderHeight,
    collapseHeaderHeight: readOnlyCollapseHeaderHeight,
    headerHeight,
    headerElevated,
    floatToolbarOffsetTop,
    floatToolbarOffsetBottom,
  };

  // Private Executions

  provide(FloatToolbarResultSymbol, result);

  // Methods

  function onScroll(details: { position: number }) {
    scrollPosition.value = details.position;
  }

  function onReveal(value: boolean) {
    revealed.value = value;
  }

  return {
    ...result,
    onScroll,
    onReveal,
  };
}

export function useFloatToolbarResult() {
  const floatToolbarResult = inject<FloatToolbarResult>(FloatToolbarResultSymbol);
  !floatToolbarResult &&
    (() => {
      throw new Error('[mnapp-float-toolbar] No float toolbar result provided.');
    })();

  return floatToolbarResult;
}
