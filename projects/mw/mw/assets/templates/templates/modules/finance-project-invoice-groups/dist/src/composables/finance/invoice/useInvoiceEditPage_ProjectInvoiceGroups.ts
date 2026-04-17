import type { Project, ProjectVm } from 'models/finance/index.js';

import { useInvoiceViewPage } from 'composables/finance/invoice/useInvoiceEditPage.js';
import type { extendInvoiceViewPage_InvoiceGroups } from 'composables/finance/invoice/useInvoiceEditPage_InvoiceGroups.js';
import type { extendInvoiceViewPage_ProjectInvoices } from 'composables/finance/invoice/useInvoiceEditPage_ProjectInvoices.js';

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useInvoiceViewPage<
    HasParent,
    HasParent extends false ? never : Project,
    HasParent extends false ? never : ProjectVm
  >
>;

function useViewPageInvoiceGroupExtra<HasParent extends boolean>($p: TViewPage<HasParent>) {
  // Private Executions

  // useInvoiceViewPageExtra
  if ($p.hasParent($p)) {
    ($p as unknown as TViewPage<true>).modelBeforeUpdateActions.value.push((payload) => {
      payload.doc.invoiceGroupIds = [
        ...new Set(
          payload.doc.quotations
            .map((value) => value.invoice?.group?.id || '')
            .filter((value) => !!value),
        ),
      ];

      return Promise.resolve();
    });
  }

  return {};
}

export function extendInvoiceViewPage_ProjectInvoiceGroups<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useInvoiceViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useViewPageInvoiceGroupExtra<HasParent>>;

  Object.assign(extension, useViewPageInvoiceGroupExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useInvoiceViewPage_ProjectInvoiceGroups(scopeName: string) {
  const $p = useInvoiceViewPage<true, Project, ProjectVm>(scopeName);

  return $p as typeof $p &
    ReturnType<typeof extendInvoiceViewPage_InvoiceGroups<true>> &
    ReturnType<typeof extendInvoiceViewPage_ProjectInvoices<true>> &
    ReturnType<typeof extendInvoiceViewPage_ProjectInvoiceGroups<true>>;
}
