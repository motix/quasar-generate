import { uid } from 'quasar';

import type { Invoice, InvoiceVm } from 'models/finance/index.js';

import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import {
  useTransactionNewPage,
  useTransactionViewPage,
} from 'composables/finance/transaction/useTransactionEditPage.js';

type TNewPage<HasParent extends boolean> = ReturnType<
  typeof useTransactionNewPage<HasParent, HasParent extends false ? never : InvoiceVm>
>;

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useTransactionViewPage<
    HasParent,
    HasParent extends false ? never : Invoice,
    HasParent extends false ? never : InvoiceVm
  >
>;

function useEditPageInvoiceExtra() {
  // Composables

  const imc = useInvoiceCalculator<Invoice>();

  return {
    imc,
  };
}

function useNewPageInvoiceExtra() {
  // Composables

  const extra = useEditPageInvoiceExtra();

  return {
    ...extra,
  };
}

function useViewPageInvoiceExtra<HasParent extends boolean>($p: TViewPage<HasParent>) {
  // Composables

  const extra = useEditPageInvoiceExtra();

  // Methods

  function fillDetailsFromInvoice() {
    if ($p.hasParent($p)) {
      const detailsLength = $p.vm.value.details.length;

      !!$p.parentModel.value &&
        $p.vm.value.details.push(
          ...$p.parentModel.value.details.map((value) => ({
            content: value.content,
            quantity: value.quantity,
            unitPrice: value.unitPrice,
            key: uid(),
          })),
          ...($p.parentModel.value.vatPercent === undefined
            ? []
            : [
                {
                  content: `VAT (${$p.f.percent($p.parentModel.value.vatPercent)})`,
                  quantity: 1,
                  unitPrice: extra.imc.invoiceVat($p.parentModel.value) as number,
                  key: uid(),
                },
              ]),
        );

      detailsLength < $p.vm.value.details.length && $p.dirty();
    }
  }

  return {
    ...extra,
    fillDetailsFromInvoice,
  };
}

export function extendTransactionNewPage_Invoices<HasParent extends boolean>(
  $p: TNewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useTransactionNewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useNewPageInvoiceExtra>;

  Object.assign(extension, useNewPageInvoiceExtra());
  Object.assign($p, extension);

  return extension;
}

export function extendTransactionViewPage_Invoices<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useTransactionViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useViewPageInvoiceExtra<HasParent>>;

  Object.assign(extension, useViewPageInvoiceExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useTransactionNewPage_Invoices<HasParent extends boolean>(scopeName: string) {
  const $p = useTransactionNewPage<HasParent, HasParent extends false ? never : InvoiceVm>(
    scopeName,
  );

  return $p as typeof $p & ReturnType<typeof extendTransactionNewPage_Invoices<HasParent>>;
}

export function useTransactionViewPage_Invoices<HasParent extends boolean>(scopeName: string) {
  const $p = useTransactionViewPage<
    HasParent,
    HasParent extends false ? never : Invoice,
    HasParent extends false ? never : InvoiceVm
  >(scopeName);

  return $p as typeof $p & ReturnType<typeof extendTransactionViewPage_Invoices<HasParent>>;
}

export default function useTransactionEditPage_Invoices<HasParent extends boolean>(
  scopeName: string,
) {
  return useCustomizedEditPage<
    ReturnType<typeof useTransactionNewPage_Invoices<HasParent>>,
    ReturnType<typeof useTransactionViewPage_Invoices<HasParent>>
  >(scopeName);
}
