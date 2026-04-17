import type { Project, ProjectVm } from 'models/finance/index.js';

import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import {
  useExpenseNewPage,
  useExpenseViewPage,
} from 'composables/finance/expense/useExpenseEditPage.js';
import type {
  extendExpenseNewPage_ExpenseGroups,
  extendExpenseViewPage_ExpenseGroups,
} from 'composables/finance/expense/useExpenseEditPage_ExpenseGroups.js';

type TNewPage<HasParent extends boolean> = ReturnType<
  typeof useExpenseNewPage<HasParent, HasParent extends false ? never : ProjectVm>
>;

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useExpenseViewPage<
    HasParent,
    HasParent extends false ? never : Project,
    HasParent extends false ? never : ProjectVm
  >
>;

function useNewPageExpenseGroupExtra<HasParent extends boolean>($p: TNewPage<HasParent>) {
  // Private Executions

  // useExpenseNewPageExtra
  if ($p.hasParent($p)) {
    ($p as unknown as TNewPage<true>).viewModelBeforeCreateActions.value.push((payload) => {
      payload.doc.expenseGroupIds = [
        ...new Set(
          payload.doc.expenses.map((value) => value.group?.id || '').filter((value) => !!value),
        ),
      ];

      return Promise.resolve();
    });
  }

  return {};
}

function useViewPageExpenseGroupExtra<HasParent extends boolean>($p: TViewPage<HasParent>) {
  // Private Executions

  // useExpenseViewPageExtra
  if ($p.hasParent($p)) {
    ($p as unknown as TViewPage<true>).modelBeforeUpdateActions.value.push((payload) => {
      payload.doc.expenseGroupIds = [
        ...new Set(
          payload.doc.expenses.map((value) => value.group?.id || '').filter((value) => !!value),
        ),
      ];

      return Promise.resolve();
    });
  }

  return {};
}

export function extendExpenseNewPage_ProjectExpenseGroups<HasParent extends boolean>(
  $p: TNewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useExpenseNewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useNewPageExpenseGroupExtra<HasParent>>;

  Object.assign(extension, useNewPageExpenseGroupExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function extendExpenseViewPage_ProjectExpenseGroups<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useExpenseViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useViewPageExpenseGroupExtra<HasParent>>;

  Object.assign(extension, useViewPageExpenseGroupExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useExpenseNewPage_ProjectExpenseGroups(scopeName: string) {
  const $p = useExpenseNewPage<true, ProjectVm>(scopeName);

  return $p as typeof $p &
    ReturnType<typeof extendExpenseNewPage_ExpenseGroups<true>> &
    ReturnType<typeof extendExpenseNewPage_ProjectExpenseGroups<true>>;
}

export function useExpenseViewPage_ProjectExpenseGroups(scopeName: string) {
  const $p = useExpenseViewPage<true, Project, ProjectVm>(scopeName);

  return $p as typeof $p &
    ReturnType<typeof extendExpenseViewPage_ExpenseGroups<true>> &
    ReturnType<typeof extendExpenseViewPage_ProjectExpenseGroups<true>>;
}

export default function useExpenseEditPage_ProjectExpenseGroups(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useExpenseNewPage_ProjectExpenseGroups>,
    ReturnType<typeof useExpenseViewPage_ProjectExpenseGroups>
  >(scopeName);
}
