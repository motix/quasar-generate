import type { ComponentPublicInstance } from 'vue';
import { computed, nextTick, ref, watch } from 'vue';

import useMultiViews from 'composables/useMultiViews.js';
import useScroll from 'composables/useScroll.js';

import type { EditPage } from './useEditPage.js';
import { extendEditPage } from './useEditPage.js';

// useNewPage | useViewPage
export default function useDetailsEditor<
  TVm extends NonNullable<unknown>,
  TDetailVm extends NonNullable<unknown>,
  TNewDetailParams extends Array<unknown>,
>(
  $p: EditPage<never, TVm, NonNullable<unknown>>,
  getDetails: (vm: TVm) => TDetailVm[],
  newDetail: (...params: TNewDetailParams) => TDetailVm,
) {
  // Private

  function scrollToDetailEditor(index: number) {
    scrollToElement(
      detailEditorRefs.value[index] ||
        (() => {
          throw new Error('[mnapp-crud-pages] Index out of range');
        })(),
    );
  }

  // Composables

  const { toTop: scrollToTop, toElement: scrollToElement } = useScroll();

  const { isCardsView } = useMultiViews();

  const $ep = extendEditPage($p);

  // Data

  const detailEditorRefs = ref<
    (ComponentPublicInstance & {
      validate: () => Promise<boolean>;
    })[]
  >([]);

  // Computed

  const showAddDetailButton = computed(
    () =>
      $p.ready.value &&
      $ep.newPageOrEditMode.value &&
      isCardsView.value &&
      getDetails($p.vm.value).length > 0,
  );

  // Methods

  function setDetailEditorRef(el: (typeof detailEditorRefs.value)[number] | null, index: number) {
    if (el !== null) {
      detailEditorRefs.value[index] = el;
    }
  }

  function addDetail(...params: TNewDetailParams) {
    insertDetail(getDetails($p.vm.value).length, ...params);
  }

  function insertDetail(index: number, ...params: TNewDetailParams) {
    const detail = newDetail(...params);
    getDetails($p.vm.value).splice(index, 0, detail);

    $p.dirty();

    if (isCardsView.value) {
      const unwatch = watch(
        computed(() => detailEditorRefs.value.length),
        (value) => {
          if (value >= getDetails($p.vm.value).length) {
            unwatch();
            void nextTick(() => {
              scrollToDetailEditor(index);
            });
          }
        },
      );
    }
  }

  function removeDetail(index: number) {
    getDetails($p.vm.value).splice(index, 1);

    $p.dirty();

    if (isCardsView.value && getDetails($p.vm.value).length === 0) {
      scrollToTop();
    }
  }

  async function validateDetailsEditor() {
    const results = await Promise.all(detailEditorRefs.value.map((value) => value.validate()));

    return !results.includes(false);
  }

  // Watch

  watch(
    computed(() => ($p.viewModel.value ? getDetails($p.viewModel.value).length : undefined)),
    () => {
      detailEditorRefs.value = [];
    },
  );

  return {
    detailEditorRefs,
    showAddDetailButton,
    setDetailEditorRef,
    addDetail,
    insertDetail,
    removeDetail,
    validateDetailsEditor,
  };
}
