import { computed, ref } from 'vue';

import { uid } from 'quasar';

import type { Project, ProjectVm } from 'models/finance/index.js';

import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import {
  useTransactionNewPage,
  useTransactionViewPage,
} from 'composables/finance/transaction/useTransactionEditPage.js';
import type {
  useTransactionNewPage_Expenses,
  useTransactionViewPage_Expenses,
} from 'composables/finance/transaction/useTransactionEditPage_Expenses.js';
import type {
  useTransactionNewPage_Invoices,
  useTransactionViewPage_Invoices,
} from 'composables/finance/transaction/useTransactionEditPage_Invoices.js';

type TNewPage<HasParent extends boolean> = ReturnType<
  typeof useTransactionNewPage<HasParent, HasParent extends false ? never : ProjectVm>
> &
  Pick<ReturnType<typeof useTransactionNewPage_Invoices>, 'imc'> &
  Pick<ReturnType<typeof useTransactionNewPage_Expenses>, 'emc'>;

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useTransactionViewPage<
    HasParent,
    HasParent extends false ? never : Project,
    HasParent extends false ? never : ProjectVm
  >
> &
  Pick<ReturnType<typeof useTransactionViewPage_Invoices>, 'imc'> &
  Pick<ReturnType<typeof useTransactionViewPage_Expenses>, 'emc'>;

function useEditPageProjectExtra<HasParent extends boolean>(
  $p: TNewPage<HasParent> | TViewPage<HasParent>,
) {
  // Data

  const isForProject = ref(false);

  return {
    imc: $p.imc,
    emc: $p.emc,
    isForProject,
  };
}

function useNewPageProjectExtra<HasParent extends boolean>($p: TNewPage<HasParent>) {
  // Private

  const project = computed(() =>
    $p.hasParent($p) && extra.isForProject.value ? $p.parentViewModel.value : undefined,
  );

  // Composables

  const extra = useEditPageProjectExtra<HasParent>($p);

  // Computed

  const quotation = computed(() =>
    $p.hasCustomer.value
      ? project.value?.quotations.find(
          (value) => value.invoice?.code === $p.directParentFindKey.value,
        )
      : undefined,
  );

  const invoice = computed(() => ($p.hasCustomer.value ? quotation.value?.invoice : undefined));

  const expense = computed(() =>
    $p.hasSupplier.value
      ? project.value?.expenses.find((value) => value.code === $p.directParentFindKey.value)
      : undefined,
  );

  return {
    ...extra,
    quotation,
    invoice,
    expense,
  };
}

function useViewPageProjectExtra<HasParent extends boolean>($p: TViewPage<HasParent>) {
  // Private

  const project = computed(() =>
    $p.hasParent($p) && extra.isForProject.value ? $p.parentModel.value : undefined,
  );

  // Composables

  const extra = useEditPageProjectExtra<HasParent>($p);

  // Computed

  const quotation = computed(() =>
    $p.hasCustomer.value
      ? project.value?.quotations.find(
          (value) => $p.model.value && value.invoice?.transactions.includes($p.model.value),
        )
      : undefined,
  );

  const invoice = computed(() => ($p.hasCustomer.value ? quotation.value?.invoice : undefined));

  const expense = computed(() =>
    $p.hasSupplier.value
      ? project.value?.expenses.find(
          (value) => $p.model.value && value.transactions.includes($p.model.value),
        )
      : undefined,
  );

  // Methods

  function fillDEtailsFromProject() {
    if ($p.hasParent($p)) {
      const detailsLength = $p.vm.value.details.length;

      !!invoice.value &&
        $p.vm.value.details.push(
          ...invoice.value.details.map((value) => ({
            content: value.content,
            quantity: value.quantity,
            unitPrice: value.unitPrice,
            key: uid(),
          })),
          ...(invoice.value.vatPercent === undefined
            ? []
            : [
                {
                  content: 'VAT',
                  quantity: 1,
                  unitPrice: $p.imc.invoiceVat(invoice.value) as number,
                  key: uid(),
                },
              ]),
        );

      !!expense.value &&
        $p.vm.value.details.push(
          ...expense.value.details.map((value) => ({
            content: value.content,
            quantity: value.quantity,
            unitPrice: value.unitPrice,
            key: uid(),
          })),
          ...(expense.value.vatPercent === undefined
            ? []
            : [
                {
                  content: 'VAT',
                  quantity: 1,
                  unitPrice: $p.emc.expenseVat(expense.value) as number,
                  key: uid(),
                },
              ]),
        );

      detailsLength < $p.vm.value.details.length && $p.dirty();
    }
  }

  return {
    ...extra,
    quotation,
    invoice,
    expense,
    fillDEtailsFromProject,
  };
}

export function extendTransactionNewPage_ProjectTransactions<HasParent extends boolean>(
  $p: TNewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useTransactionNewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useNewPageProjectExtra<HasParent>>;

  Object.assign(extension, useNewPageProjectExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function extendTransactionViewPage_ProjectTransactions<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useTransactionViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useViewPageProjectExtra<HasParent>>;

  Object.assign(extension, useViewPageProjectExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useTransactionNewPage_ProjectTransactions(scopeName: string) {
  const $p = useTransactionNewPage<true, ProjectVm>(scopeName);

  return $p as typeof $p & ReturnType<typeof extendTransactionNewPage_ProjectTransactions<true>>;
}

export function useTransactionViewPage_ProjectTransactions(scopeName: string) {
  const $p = useTransactionViewPage<true, Project, ProjectVm>(scopeName);

  return $p as typeof $p & ReturnType<typeof extendTransactionViewPage_ProjectTransactions<true>>;
}

export default function useTransactionEditPage_ProjectTransactions(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useTransactionNewPage_ProjectTransactions>,
    ReturnType<typeof useTransactionViewPage_ProjectTransactions>
  >(scopeName);
}
