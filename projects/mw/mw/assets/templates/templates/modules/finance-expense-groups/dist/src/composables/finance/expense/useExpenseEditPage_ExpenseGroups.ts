import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import {
  useExpenseNewPage,
  useExpenseViewPage,
} from 'composables/finance/expense/useExpenseEditPage.js';
import useExpenseGroupOptions from 'composables/finance/shared/useExpenseGroupOptions.js';

type TNewPage<HasParent extends boolean> = ReturnType<
  typeof useExpenseNewPage<HasParent, HasParent extends false ? never : NonNullable<unknown>>
>;

type TViewPage<HasParent extends boolean> = ReturnType<
  typeof useExpenseViewPage<
    HasParent,
    HasParent extends false ? never : NonNullable<unknown>,
    HasParent extends false ? never : NonNullable<unknown>
  >
>;

function useEditPageExpenseGroupsExtra<HasParent extends boolean>(
  $p: TNewPage<HasParent> | TViewPage<HasParent>,
) {
  // Composables

  const { expenseGroupOptions, expenseGroupsEditorDependenciesStore, filterExpenseGroupOptions } =
    useExpenseGroupOptions();

  // Private Executions

  $p.editorDependenciesStores.value.push(expenseGroupsEditorDependenciesStore);

  return {
    expenseGroupOptions,
    filterExpenseGroupOptions,
  };
}

export function extendExpenseNewPage_ExpenseGroups<HasParent extends boolean>(
  $p: TNewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useExpenseNewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useEditPageExpenseGroupsExtra<HasParent>>;

  Object.assign(extension, useEditPageExpenseGroupsExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function extendExpenseViewPage_ExpenseGroups<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useExpenseViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useEditPageExpenseGroupsExtra<HasParent>>;

  Object.assign(extension, useEditPageExpenseGroupsExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useExpenseNewPage_ExpenseGroups<HasParent extends boolean>(scopeName: string) {
  const $p = useExpenseNewPage<HasParent, HasParent extends false ? never : NonNullable<unknown>>(
    scopeName,
  );

  return $p as typeof $p & ReturnType<typeof extendExpenseNewPage_ExpenseGroups<HasParent>>;
}

export function useExpenseViewPage_ExpenseGroups<HasParent extends boolean>(scopeName: string) {
  const $p = useExpenseViewPage<
    HasParent,
    HasParent extends false ? never : NonNullable<unknown>,
    HasParent extends false ? never : NonNullable<unknown>
  >(scopeName);

  return $p as typeof $p & ReturnType<typeof extendExpenseViewPage_ExpenseGroups<HasParent>>;
}

export default function useExpenseEditPage_ExpenseGroups<HasParent extends boolean>(
  scopeName: string,
) {
  return useCustomizedEditPage<
    ReturnType<typeof useExpenseNewPage_ExpenseGroups<HasParent>>,
    ReturnType<typeof useExpenseViewPage_ExpenseGroups<HasParent>>
  >(scopeName);
}
