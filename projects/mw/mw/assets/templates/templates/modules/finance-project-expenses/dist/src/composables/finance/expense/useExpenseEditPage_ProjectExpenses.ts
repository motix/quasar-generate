import type { Component } from 'vue';

import { date } from 'quasar';

import { sortBy } from 'lodash-es';

import type { Project, ProjectVm } from 'models/finance/index.js';

import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import {
  useExpenseNewPage,
  useExpenseViewPage,
} from 'composables/finance/expense/useExpenseEditPage.js';
import { requiredConfigEntries } from 'composables/useConfig.js';

export const projectExpenseEditPageComponentStore: {
  projectExpenseViewer: Component | null;
  projectExpenseEditorMain: Component | null;
} = {
  projectExpenseViewer: null,
  projectExpenseEditorMain: null,
};

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

function useNewPageProjectExtra<HasParent extends boolean>($p: TNewPage<HasParent>) {
  // Composables

  const { editDateFormat } = requiredConfigEntries('editDateFormat');

  // Private Executions

  // useExpenseNewPageExtra
  if ($p.hasParent($p)) {
    ($p as unknown as TNewPage<true>).viewModelBeforeCreateActions.value.push((payload) => {
      $p.pvm.value.expenses = sortBy($p.pvm.value.expenses, (value) =>
        date.extractDate(value.issueDate, editDateFormat),
      );

      payload.doc.supplierIds = [
        ...new Set(
          payload.doc.expenses.map((value) => value.supplier?.id || '').filter((value) => !!value),
        ),
      ];

      return Promise.resolve();
    });
  }

  return {};
}

function useViewPageProjectExtra<HasParent extends boolean>($p: TViewPage<HasParent>) {
  // Composables

  const { editDateFormat } = requiredConfigEntries('editDateFormat');

  // Private Executions

  // useTransactions
  if ($p.hasParent($p)) {
    $p.generateNewTransactionUrl.value = () =>
      `/project-transactions/${
        $p.parentModel.value?.urlFriendlyName
      }/${$p.m.value.code.replaceAll('.', '_')}/new`;
    $p.generateViewTransactionUrl.value = () =>
      `/project-transactions/${$p.parentModel.value?.urlFriendlyName}`;
  }

  // useExpenseViewPageExtra
  if ($p.hasParent($p)) {
    ($p as unknown as TViewPage<true>).modelBeforeUpdateActions.value.push((payload) => {
      payload.isViewModel &&
        ($p.pvm.value.expenses = sortBy($p.pvm.value.expenses, (value) =>
          date.extractDate(value.issueDate, editDateFormat),
        ));

      payload.doc.supplierIds = [
        ...new Set(
          payload.doc.expenses.map((value) => value.supplier?.id || '').filter((value) => !!value),
        ),
      ];

      return Promise.resolve();
    });
  }

  return {};
}

export function extendExpenseNewPage_ProjectExpenses<HasParent extends boolean>(
  $p: TNewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useExpenseNewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useNewPageProjectExtra<HasParent>>;

  Object.assign(extension, useNewPageProjectExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function extendExpenseViewPage_ProjectExpenses<HasParent extends boolean>(
  $p: TViewPage<HasParent>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useExpenseViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useViewPageProjectExtra<HasParent>>;

  Object.assign(extension, useViewPageProjectExtra<HasParent>($p));
  Object.assign($p, extension);

  return extension;
}

export function useExpenseNewPage_ProjectExpenses(scopeName: string) {
  const $p = useExpenseNewPage<true, ProjectVm>(scopeName);

  return $p as typeof $p & ReturnType<typeof extendExpenseNewPage_ProjectExpenses<true>>;
}

export function useExpenseViewPage_ProjectExpenses(scopeName: string) {
  const $p = useExpenseViewPage<true, Project, ProjectVm>(scopeName);

  return $p as typeof $p & ReturnType<typeof extendExpenseViewPage_ProjectExpenses<true>>;
}

export default function useExpenseEditPage_ProjectExpenses(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useExpenseNewPage_ProjectExpenses>,
    ReturnType<typeof useExpenseViewPage_ProjectExpenses>
  >(scopeName);
}
