import type { Component } from 'vue';
import { computed } from 'vue';

import type { Project, ProjectVm } from 'models/finance/index.js';

import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';

export const projectInvoiceEditPageComponentStore: {
  projectInvoiceViewer: Component | null;
  projectInvoiceEditorMain: Component | null;
} = {
  projectInvoiceViewer: null,
  projectInvoiceEditorMain: null,
};

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useInvoiceViewPage<
    HasParent,
    HasParent extends false ? never : Project,
    HasParent extends false ? never : ProjectVm
  >
>;

function useViewPageProjectExtra($p: TViewPage<true>) {
  // Computed

  const quotation = computed(() =>
    $p.parentModel.value?.quotations.find((value) => value.invoice === $p.model.value),
  );

  // Private Executions

  $p.generateNewTransactionUrl.value = () =>
    `/project-transactions/${
      $p.parentModel.value?.urlFriendlyName
    }/${$p.m.value.code.replaceAll('.', '_')}/new`;
  $p.generateViewTransactionUrl.value = () =>
    `/project-transactions/${$p.parentModel.value?.urlFriendlyName}`;

  return {
    quotation,
  };
}

export function extendInvoiceViewPage_ProjectInvoices<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useInvoiceViewPage has done initialization');
    })();

  const extension = {} as HasParent extends true
    ? ReturnType<typeof useViewPageProjectExtra>
    : Record<keyof ReturnType<typeof useViewPageProjectExtra>, undefined>;

  $p.hasParent($p) &&
    Object.assign(extension, useViewPageProjectExtra($p as unknown as TViewPage<true>));
  Object.assign($p, extension);

  return extension;
}

export function useInvoiceViewPage_ProjectInvoices(scopeName: string) {
  const $p = useInvoiceViewPage<true, Project, ProjectVm>(scopeName);

  return $p as typeof $p & ReturnType<typeof extendInvoiceViewPage_ProjectInvoices<true>>;
}
