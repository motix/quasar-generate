import { useRouter } from 'vue-router';

import type { Invoice, Quotation } from 'models/finance/index.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import type { extendProjectViewPage_ProjectInvoicesExpensesSupport } from 'composables/finance/project/useProjectViewPage_ProjectInvoicesExpensesSupport.js';
import useProjectViewPage_Quotations from 'composables/finance/project/useProjectViewPage_Quotations.js';

type TViewPage = ReturnType<typeof useProjectViewPage_Quotations> &
  ReturnType<typeof extendProjectViewPage_ProjectInvoicesExpensesSupport>;

function useInvoicesExtra($p: TViewPage) {
  // Private

  const router = useRouter();

  // Composables

  const imc = useInvoiceCalculator<Invoice>();

  // Private Executions

  $p.processGeneratedQuotation.value = (quotation: Quotation) => {
    $p.m.value.quotations.forEach((value) => {
      if (value !== quotation && value.invoice) {
        value.invoice.isCancelled = true;
      }
    });
  };

  // Methods

  function onInvoiceClick(invoice: Invoice) {
    // Wait for the ripple
    setTimeout(() => {
      void router.push(
        `/project-invoices/${$p.m.value.urlFriendlyName}/${invoice.code.replaceAll('.', '_')}`,
      );
    }, 300);
  }

  return {
    imc,
    onInvoiceClick,
  };
}

export function extendProjectViewPage_ProjectInvoices($p: TViewPage) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useProjectViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useInvoicesExtra>;

  Object.assign(extension, useInvoicesExtra($p));
  Object.assign($p, extension);

  return extension;
}

export default function useProjectViewPage_ProjectInvoices(scopeName: string) {
  const $p = useProjectViewPage_Quotations(scopeName);

  return $p as typeof $p &
    ReturnType<typeof extendProjectViewPage_ProjectInvoices> &
    ReturnType<typeof extendProjectViewPage_ProjectInvoicesExpensesSupport>;
}
