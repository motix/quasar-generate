import { computed, ref } from 'vue';

import type { Project, Quotation } from 'models/finance/index.js';

import useViewChildPage from 'composables/crud-pages/useViewChildPage.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useProjectCalculator from 'composables/finance/project/useProjectCalculator.js';
import useQuotationCalculator from 'composables/finance/quotation/useQuotationCalculator.js';
import useFormats from 'composables/useFormats.js';

export const quotationViewPageExtensions: ((
  $p: ReturnType<typeof useQuotationViewPage>,
) => void)[] = [];

function useViewQuotaionChildPage($p: ViewPage<Quotation, never, NonNullable<unknown>>) {
  return useViewChildPage<Quotation, never, Project, never>($p);
}

function useQuotationViewPageExtra(
  $p: ViewPage<Quotation, never, ReturnType<typeof useViewQuotaionChildPage>>,
) {
  // Composables

  const f = useFormats();

  const mc = useQuotationCalculator<Quotation>();
  const pmc = useProjectCalculator<Project>();

  // Data

  const showComparision = ref(false);

  // Computed

  const showToggleComparisionButton = computed(() => !!$p.model.value);

  const showPrintButton = computed(() => $p.ready.value && !$p.editMode.value);

  const showExportToExcelButton = computed(() => $p.ready.value && !$p.editMode.value);

  const displayDetails = computed(() =>
    $p.m.value.details.filter((value) => !value.isProductionOnly),
  );

  const projectAddedItems = computed(() =>
    $p.pm.value.items.filter(
      (item) => !$p.m.value.details.some((detail) => detail.content === item.title),
    ),
  );

  return {
    f,
    mc,
    pmc,
    showComparision,
    showToggleComparisionButton,
    showPrintButton,
    showExportToExcelButton,
    displayDetails,
    projectAddedItems,
  };
}

export default function useQuotationViewPage(scopeName: string, hitUseCount?: boolean) {
  type AllExtras = ReturnType<typeof useViewQuotaionChildPage> &
    ReturnType<typeof useQuotationViewPageExtra>;

  // Composables

  const $p = useViewPage<Quotation, never, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    Object.assign($p, useViewQuotaionChildPage($p));
    Object.assign($p, useQuotationViewPageExtra($p));

    quotationViewPageExtensions.forEach((value) => value($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}
