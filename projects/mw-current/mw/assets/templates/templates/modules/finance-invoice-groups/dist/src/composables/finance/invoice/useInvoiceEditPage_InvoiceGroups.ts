import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import {
  useInvoiceNewPage,
  useInvoiceViewPage,
} from 'composables/finance/invoice/useInvoiceEditPage.js';
import useInvoiceGroupOptions from 'composables/finance/shared/useInvoiceGroupOptions.js';

type TNewPage<HasParent extends boolean> = ReturnType<
  typeof useInvoiceNewPage<HasParent, HasParent extends false ? never : NonNullable<unknown>>
>;

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useInvoiceViewPage<
    HasParent,
    HasParent extends false ? never : NonNullable<unknown>,
    HasParent extends false ? never : NonNullable<unknown>
  >
>;

function useEditPageInvoiceGroupsExtra<HasParent extends boolean>(
  $p: TNewPage<HasParent> | TViewPage<HasParent>,
) {
  // Composables

  const { invoiceGroupOptions, invoiceGroupsEditorDependenciesStore, filterInvoiceGroupOptions } =
    useInvoiceGroupOptions();

  // Private Executions

  $p.editorDependenciesStores.value.push(invoiceGroupsEditorDependenciesStore);

  return {
    invoiceGroupOptions,
    filterInvoiceGroupOptions,
  };
}

export function extendInvoiceNewPage_InvoiceGroups<HasParent extends boolean>(
  $p: TNewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useInvoiceNewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useEditPageInvoiceGroupsExtra<HasParent>>;

  Object.assign(extension, useEditPageInvoiceGroupsExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function extendInvoiceViewPage_InvoiceGroups<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useInvoiceViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useEditPageInvoiceGroupsExtra<HasParent>>;

  Object.assign(extension, useEditPageInvoiceGroupsExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useInvoiceNewPage_InvoiceGroups<HasParent extends boolean>(scopeName: string) {
  const $p = useInvoiceNewPage<HasParent, HasParent extends false ? never : NonNullable<unknown>>(
    scopeName,
  );

  return $p as typeof $p & ReturnType<typeof extendInvoiceNewPage_InvoiceGroups<HasParent>>;
}

export function useInvoiceViewPage_InvoiceGroups<HasParent extends boolean>(scopeName: string) {
  const $p = useInvoiceViewPage<
    HasParent,
    HasParent extends false ? never : NonNullable<unknown>,
    HasParent extends false ? never : NonNullable<unknown>
  >(scopeName);

  return $p as typeof $p & ReturnType<typeof extendInvoiceViewPage_InvoiceGroups<HasParent>>;
}

export default function useInvoiceEditPage_InvoiceGroups<HasParent extends boolean>(
  scopeName: string,
) {
  return useCustomizedEditPage<
    ReturnType<typeof useInvoiceNewPage_InvoiceGroups<HasParent>>,
    ReturnType<typeof useInvoiceViewPage_InvoiceGroups<HasParent>>
  >(scopeName);
}
