import { computed, ref, watchEffect } from 'vue';

import { uid } from 'quasar';

import type { ItemVm, Project, ProjectVm } from 'models/finance/index.js';

import useDetailsEditor from 'composables/crud-pages/useDetailsEditor.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useProjectCalculator from 'composables/finance/project/useProjectCalculator.js';
import useFormats from 'composables/useFormats.js';

export const projectViewPageExtensions: (($p: ReturnType<typeof useProjectViewPage>) => void)[] =
  [];

function useItemsEditor($p: ViewPage<Project, ProjectVm, NonNullable<unknown>>) {
  // Composables

  const extra = useDetailsEditor<ProjectVm, ItemVm, []>(
    $p,
    (vm) => vm.items,
    () => ({
      isProductionOnly: false,
      isFinanceOnly: true,
      isQuotationOnly: false,
      title: '',
      number: '',
      description: '',
      productType: '',
      quantity: 1,
      productionSalaryUnitPrice: '',
      unitPrice: '',
      key: uid(),
    }),
  );

  return {
    itemEditorRefs: extra.detailEditorRefs,
    showAddItemButton: extra.showAddDetailButton,
    setItemEditorRef: extra.setDetailEditorRef,
    addItem: extra.addDetail,
    insertItem: extra.insertDetail,
    removeItem: extra.removeDetail,
    validateItemsEditor: extra.validateDetailsEditor,
  };
}

function useCollectionsHaveItems() {
  // Data

  const collectionsHaveItems = ref<Record<string, boolean>>({});

  // Computed

  const anyCollectionHasItems = computed(() => {
    for (const collection in collectionsHaveItems.value) {
      if (collectionsHaveItems.value[collection]) {
        return true;
      }
    }

    return false;
  });

  return {
    collectionsHaveItems,
    anyCollectionHasItems,
  };
}

function useProjectViewPageExtra(
  $p: ViewPage<
    Project,
    ProjectVm,
    ReturnType<typeof useItemsEditor> & ReturnType<typeof useCollectionsHaveItems>
  >,
) {
  // Private

  const addItem = $p.addItem;

  // Composables

  const f = useFormats();

  const mc = useProjectCalculator<Project>();
  const vmc = useProjectCalculator<ProjectVm>();

  // Method Refs

  const validateProjectAdditionEditor = ref<(() => Promise<boolean>) | null>(null);

  // Methods

  function switchToEditModeAndAddItem() {
    if (!$p.editMode.value) {
      $p.openToolbar();
      $p.editMode.value = true;
    }

    addItem();
  }

  // Watch

  watchEffect(() => {
    $p.collectionsHaveItems.value.items =
      (($p.editMode.value ? $p.viewModel.value?.items.length : $p.model.value?.items.length) || 0) >
      0;
  });

  return {
    f,
    mc,
    vmc,
    validateProjectAdditionEditor,
    addItem: switchToEditModeAndAddItem,
  };
}

export default function useProjectViewPage(scopeName: string, hitUseCount?: boolean) {
  type AllExtras = ReturnType<typeof useItemsEditor> &
    ReturnType<typeof useCollectionsHaveItems> &
    ReturnType<typeof useProjectViewPageExtra>;

  // Composables

  const $p = useViewPage<Project, ProjectVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    Object.assign($p, useItemsEditor($p));
    Object.assign($p, useCollectionsHaveItems());
    Object.assign($p, useProjectViewPageExtra($p));

    projectViewPageExtensions.forEach((value) => value($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}
