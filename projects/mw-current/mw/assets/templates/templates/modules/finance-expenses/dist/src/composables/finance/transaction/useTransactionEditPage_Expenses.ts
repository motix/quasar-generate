import { uid } from 'quasar';

import type { Expense, ExpenseVm } from 'models/finance/index.js';

import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import {
  useTransactionNewPage,
  useTransactionViewPage,
} from 'composables/finance/transaction/useTransactionEditPage.js';

type TNewPage<HasParent extends boolean> = ReturnType<
  typeof useTransactionNewPage<HasParent, HasParent extends false ? never : ExpenseVm>
>;

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useTransactionViewPage<
    HasParent,
    HasParent extends false ? never : Expense,
    HasParent extends false ? never : ExpenseVm
  >
>;

function useEditPageExpenseExtra() {
  // Composables

  const emc = useExpenseCalculator<Expense>();

  return {
    emc,
  };
}

function useNewPageExpenseExtra() {
  // Composables

  const extra = useEditPageExpenseExtra();

  return {
    ...extra,
  };
}

function useViewPageExpenseExtra<HasParent extends boolean>($p: TViewPage<HasParent>) {
  // Composables

  const extra = useEditPageExpenseExtra();

  // Methods

  function fillDetailsFromExpense() {
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
                  unitPrice: extra.emc.expenseVat($p.parentModel.value) as number,
                  key: uid(),
                },
              ]),
        );

      detailsLength < $p.vm.value.details.length && $p.dirty();
    }
  }

  return {
    ...extra,
    fillDetailsFromExpense,
  };
}

export function extendTransactionNewPage_Expenses<HasParent extends boolean>(
  $p: TNewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useTransactionNewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useNewPageExpenseExtra>;

  Object.assign(extension, useNewPageExpenseExtra());
  Object.assign($p, extension);

  return extension;
}

export function extendTransactionViewPage_Expenses<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useTransactionViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useViewPageExpenseExtra<HasParent>>;

  Object.assign(extension, useViewPageExpenseExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useTransactionNewPage_Expenses<HasParent extends boolean>(scopeName: string) {
  const $p = useTransactionNewPage<HasParent, HasParent extends false ? never : ExpenseVm>(
    scopeName,
  );

  return $p as typeof $p & ReturnType<typeof extendTransactionNewPage_Expenses<HasParent>>;
}

export function useTransactionViewPage_Expenses<HasParent extends boolean>(scopeName: string) {
  const $p = useTransactionViewPage<
    HasParent,
    HasParent extends false ? never : Expense,
    HasParent extends false ? never : ExpenseVm
  >(scopeName);

  return $p as typeof $p & ReturnType<typeof extendTransactionViewPage_Expenses<HasParent>>;
}

export default function useTransactionEditPage_Expenses<HasParent extends boolean>(
  scopeName: string,
) {
  return useCustomizedEditPage<
    ReturnType<typeof useTransactionNewPage_Expenses<HasParent>>,
    ReturnType<typeof useTransactionViewPage_Expenses<HasParent>>
  >(scopeName);
}
