import { computed, ref, watch } from 'vue';

import { uid } from 'quasar';

import type { ItemContributionVm, ItemVm, Project, ProjectVm } from 'models/production/index.js';

import useDetailsEditor from 'composables/crud-pages/useDetailsEditor.js';
import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import useNewPage from 'composables/crud-pages/useNewPage/index.js';
import useSubDetailsEditor from 'composables/crud-pages/useSubDetailsEditor.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useProjectCalculator from 'composables/production/project/useProjectCalculator.js';
import useCustomerOptions from 'composables/production/shared/useCustomerOptions.js';
import useMemberOptions from 'composables/production/shared/useMemberOptions.js';
import useProductTypeOptions from 'composables/production/shared/useProductTypeOptions.js';
import useFormats from 'composables/useFormats.js';
import useMultiViews from 'composables/useMultiViews.js';

function useItemsEditor($p: ViewPage<Project, ProjectVm, Record<string, unknown>>) {
  // Composables

  const extra = useDetailsEditor<ProjectVm, ItemVm, []>(
    $p,
    (vm) => vm.items,
    () => ({
      title: '',
      number: '',
      description: '',
      quantity: 1,
      contributions: [],
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

function useItemContributionsEditor($p: ViewPage<Project, ProjectVm, Record<string, unknown>>) {
  // Composables

  const extra = useSubDetailsEditor<ProjectVm, ItemVm, ItemContributionVm, []>(
    $p,
    (vm) => vm.items,
    (vm, detailIndex) =>
      (
        vm.items[detailIndex] ||
        (() => {
          throw new Error('[production-projects] Index out of range');
        })()
      ).contributions,
    () => ({
      productionSalaryBase: '',
      involvement: 1,
      priceFactor: 1,
      key: uid(),
    }),
  );

  return {
    itemContributionEditorRefs: extra.subDetailEditorRefs,
    setItemContributionEditorRef: extra.setSubDetailEditorRef,
    addItemContribution: extra.addSubDetail,
    insertItemContribution: extra.insertSubDetail,
    removeItemContribution: extra.removeSubDetail,
    validateItemContributionsEditor: extra.validateSubDetailsEditor,
    watchItemContributionsLength: extra.watchSubDetailsLength,
  };
}

function useProjectEditPageExtra(editMode: undefined | ViewPage<never, never>['editMode']) {
  // Composables

  const f = useFormats();

  const { editorReady, editorDependenciesStores } = useEditorDependencies(editMode);

  const { memberOptions, membersEditorDependenciesStore, members, filterMemberOptions } =
    useMemberOptions();

  const { customerOptions, customersEditorDependenciesStore, filterCustomerOptions } =
    useCustomerOptions();

  // Private Executions

  editorDependenciesStores.value = [
    membersEditorDependenciesStore,
    customersEditorDependenciesStore,
  ];

  return {
    f,
    editorReady,
    editorDependenciesStores,
    memberOptions,
    members,
    customerOptions,
    filterMemberOptions,
    filterCustomerOptions,
  };
}

function useProjectNewPageExtra() {
  return useProjectEditPageExtra(undefined);
}

function useProjectViewPageExtra(
  $p: ViewPage<Project, ProjectVm, ReturnType<typeof useItemsEditor>>,
) {
  // Private

  const { isCardsView } = useMultiViews();

  const addItem = $p.addItem;

  // Composables

  const extra = useProjectEditPageExtra($p.editMode);

  const mc = useProjectCalculator<Project>();
  const vmc = useProjectCalculator<ProjectVm>();

  const {
    productTypeOptions,
    productTypesEditorDependenciesStore,
    productTypes,
    filterProductTypeOptions,
  } = useProductTypeOptions();

  // Data

  const hideContributions = ref(false);

  // Computed

  const hasItems = computed(
    () =>
      (($p.editMode.value ? $p.viewModel.value?.items.length : $p.model.value?.items.length) || 0) >
      0,
  );

  const showToggleContributionsButton = computed(
    () => $p.ready.value && !$p.editMode.value && hasItems.value,
  );

  const showAddItemButton = computed(
    () => $p.ready.value && $p.editMode.value && isCardsView.value && hasItems.value,
  );

  // Private Executions

  extra.editorDependenciesStores.value.push(productTypesEditorDependenciesStore);

  // Methods

  function switchToEditModeAndAddItem() {
    if (!$p.editMode.value) {
      $p.openToolbar();
      $p.editMode.value = true;
    }

    if (extra.editorReady.value) {
      addItem();
    } else {
      const stopWatch = watch(extra.editorReady, () => {
        if (extra.editorReady.value) {
          stopWatch();
          addItem();
        }
      });
    }
  }

  function updateItemContribution(itemIndex: number, itemContributionIndex: number) {
    const item =
      $p.vm.value.items[itemIndex] ||
      (() => {
        throw new Error('[production-projects] Index out of range');
      })();
    const currentProductType = productTypes.value.find(
      (value) => value.id === item.productType?.id,
    );

    if (!currentProductType) return;

    const itemContribution =
      item.contributions[itemContributionIndex] ||
      (() => {
        throw new Error('[production-projects] Index out of range');
      })();
    const productionSalaryDetail = currentProductType.productionSalaryDetails.find(
      (value) => value.productionRole.id === itemContribution.productionRole?.id,
    );

    if (productionSalaryDetail) {
      itemContribution.productionSalaryBase = productionSalaryDetail.productionSalary;
    } else {
      itemContribution.productionRole = undefined; // Allow undefined while editing
      itemContribution.productionSalaryBase = '';
    }
  }

  return {
    ...extra,
    mc,
    vmc,
    productTypeOptions,
    productTypes,
    hideContributions,
    hasItems,
    showToggleContributionsButton,
    showAddItemButton,
    filterProductTypeOptions,
    addItem: switchToEditModeAndAddItem,
    updateItemContribution,
  };
}

export function useProjectNewPage(scopeName: string, hitUseCount?: boolean) {
  type AllExtras = ReturnType<typeof useProjectNewPageExtra>;

  // Composables

  const $p = useNewPage<ProjectVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    Object.assign($p, useProjectNewPageExtra());

    $p.extraInitialized.value = true;
  }

  return $p;
}

export function useProjectViewPage(scopeName: string, hitUseCount?: boolean) {
  type AllExtras = ReturnType<typeof useItemsEditor> &
    ReturnType<typeof useItemContributionsEditor> &
    ReturnType<typeof useProjectViewPageExtra>;

  // Composables

  const $p = useViewPage<Project, ProjectVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    Object.assign($p, useItemsEditor($p));
    Object.assign($p, useItemContributionsEditor($p));
    Object.assign($p, useProjectViewPageExtra($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export default function useProjectEditPage(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useProjectNewPage>,
    ReturnType<typeof useProjectViewPage>
  >(scopeName);
}
