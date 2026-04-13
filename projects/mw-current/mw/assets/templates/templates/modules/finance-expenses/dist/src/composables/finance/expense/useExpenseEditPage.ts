import type { Component } from 'vue';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { date, uid } from 'quasar';

import type { Expense, ExpenseDetailVm, ExpenseVm, Transaction } from 'models/finance/index.js';

import type {
  CreateDocActionPayload,
  UpdateDocActionPayload,
} from 'stores/firebase-firestore/index.js';

import { generateCode, regenerateCode } from 'services/global/index.js';

import useDetailsEditor from 'composables/crud-pages/useDetailsEditor.js';
import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import type { NewChildPage } from 'composables/crud-pages/useNewChildPage.js';
import useNewChildPage from 'composables/crud-pages/useNewChildPage.js';
import type { NewPage } from 'composables/crud-pages/useNewPage/index.js';
import useNewPage from 'composables/crud-pages/useNewPage/index.js';
import { useChildPageNarrower } from 'composables/crud-pages/usePageNarrower.js';
import type { ViewChildPage } from 'composables/crud-pages/useViewChildPage.js';
import useViewChildPage from 'composables/crud-pages/useViewChildPage.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useSupplierOptions from 'composables/finance/shared/useSupplierOptions.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

export const expenseNewPageExtensions: (<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ReturnType<typeof useExpenseNewPage<HasParent, TParentVm>>,
) => void)[] = [];

export const expenseViewPageExtensions: (<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ReturnType<typeof useExpenseViewPage<HasParent, TParent, TParentVm>>,
) => void)[] = [];

export const expenseEditPageComponentStore: {
  expenseViewer: Component | null;
  expenseEditorMain: Component | null;
} = {
  expenseViewer: null,
  expenseEditorMain: null,
};

function useExpenseDetailsEditor($p: ViewPage<Expense, ExpenseVm, NonNullable<unknown>>) {
  // Composables

  return useDetailsEditor<ExpenseVm, ExpenseDetailVm, []>(
    $p,
    (vm) => vm.details,
    () => ({
      content: '',
      quantity: 1,
      unitPrice: '',
      key: uid(),
    }),
  );
}

function useCollectionsHaveItems() {
  // Data

  const collectionsHaveItems = ref<Record<string, boolean>>({});

  // Computed

  const anyCollectionHasItems = computed(() => {
    for (const collection in collectionsHaveItems.value) {
      if (collectionsHaveItems.value[collection]) {
        return true;
      }
    }

    return false;
  });

  return {
    collectionsHaveItems,
    anyCollectionHasItems,
  };
}

function useTransactions(
  $p: ViewPage<Expense, ExpenseVm, ReturnType<typeof useCollectionsHaveItems>>,
) {
  // Composables

  const router = useRouter();

  const tmc = useTransactionCalculator<Transaction>();

  // Method Refs

  const generateNewTransactionUrl = ref(
    () => `/general-expense-transactions/${$p.m.value.code.replaceAll('.', '_')}/new`,
  );
  const generateViewTransactionUrl = ref(
    () => `/general-expense-transactions/${$p.m.value.code.replaceAll('.', '_')}`,
  );

  // Computed

  const showAddTransactionButton = computed(() => !$p.readonlyMode.value && !$p.editMode.value);

  const newTransactionUrl = computed(() => generateNewTransactionUrl.value());

  const viewTransactionUrl = computed(() => generateViewTransactionUrl.value());

  // Methods

  function onTransactionClick(transaction: Transaction) {
    // Wait for the ripple
    setTimeout(() => {
      void router.push(`${viewTransactionUrl.value}/${transaction.code.replaceAll('.', '_')}`);
    }, 300);
  }

  // Watch

  watchEffect(() => {
    $p.collectionsHaveItems.value.transactions =
      (($p.editMode.value
        ? $p.viewModel.value?.transactions.length
        : $p.model.value?.transactions.length) || 0) > 0;
  });

  return {
    tmc,
    generateNewTransactionUrl,
    generateViewTransactionUrl,
    showAddTransactionButton,
    newTransactionUrl,
    viewTransactionUrl,
    onTransactionClick,
  };
}

function useExpenseEditPageExtra(editMode: undefined | ViewPage<never, never>['editMode']) {
  // Composables

  const f = useFormats();

  const vmc = useExpenseCalculator<ExpenseVm>();

  const { editorReady, editorDependenciesStores } = useEditorDependencies(editMode);

  const { supplierOptions, suppliersEditorDependenciesStore, filterSupplierOptions } =
    useSupplierOptions();

  // Private Executions

  editorDependenciesStores.value = [suppliersEditorDependenciesStore];

  return {
    f,
    vmc,
    editorReady,
    editorDependenciesStores,
    supplierOptions,
    filterSupplierOptions,
  };
}

function useExpenseNewPageExtra<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>($p: NewPage<ExpenseVm, NonNullable<unknown>>) {
  // Composables

  const { editDateFormat } = requiredConfigEntries('editDateFormat');

  const extra = useExpenseEditPageExtra(undefined);

  // Data

  const viewModelBeforeCreateActions = ref<
    ((
      payload: HasParent extends false
        ? CreateDocActionPayload<ExpenseVm>
        : UpdateDocActionPayload<TParentVm>,
    ) => Promise<void>)[]
  >([
    async () => {
      $p.vm.value.supplier === undefined &&
        (() => {
          throw new Error('supplier not specified');
        })();

      $p.vm.value.code = await generateCode(
        'EP',
        date.formatDate(date.extractDate($p.vm.value.createDate, editDateFormat), '.YY.MM.DD'),
        $p.vm.value.supplier.code.toUpperCase(),
      );
    },
  ]);

  // Methods

  async function viewModelBeforeCreate(
    payload: HasParent extends false
      ? CreateDocActionPayload<ExpenseVm>
      : UpdateDocActionPayload<TParentVm>,
  ) {
    for (const action of viewModelBeforeCreateActions.value) {
      await action(payload);
    }
  }

  return {
    ...extra,
    viewModelBeforeCreateActions,
    viewModelBeforeCreate,
  };
}

function useExpenseViewPageExtra<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ViewPage<
    Expense,
    ExpenseVm,
    ReturnType<typeof useExpenseDetailsEditor> & ReturnType<typeof useCollectionsHaveItems>
  >,
) {
  // Private

  const addDetail = $p.addDetail;

  // Composables

  const extra = useExpenseEditPageExtra($p.editMode);

  const mc = useExpenseCalculator<Expense>();

  // Data

  const modelBeforeUpdateActions = ref<
    ((
      payload: UpdateDocActionPayload<
        HasParent extends false ? Expense | ExpenseVm : TParent | TParentVm
      >,
    ) => Promise<void>)[]
  >([
    async (payload) => {
      if (!payload.isViewModel) {
        return;
      }

      !$p.vm.value.supplier &&
        (() => {
          throw new Error('supplier not specified');
        })();

      if (!extra.f.isNumber($p.vm.value.vatPercent)) {
        $p.vm.value.vatableAmount = '';
        $p.vm.value.secondVatPercent = '';
        $p.vm.value.secondVatableAmount = '';
        $p.vm.value.vatAdjustment = '';
      }

      if (
        !$p.deleting.value && // When deleting child page, model is reassigned to another child or null
        $p.vm.value.supplier.code !== $p.m.value.supplier.code
      ) {
        $p.vm.value.code = await regenerateCode(
          $p.vm.value.code,
          $p.vm.value.supplier.code.toUpperCase(),
        );

        for (const transaction of $p.vm.value.transactions) {
          transaction.code = await regenerateCode(
            transaction.code,
            $p.vm.value.supplier.code.toUpperCase(),
          );
        }
      }
    },
  ]);

  // Method Refs

  const validateExpenseAdditionEditor = ref<(() => Promise<boolean>) | null>(null);

  // Computed

  const isCompleted = computed(
    () =>
      $p.model.value?.statusHelper.statusName !== 'new' &&
      $p.model.value?.statusHelper.statusName !== 'rejected',
  );

  // Methods

  function switchToEditModeAndAddDetail() {
    if (!$p.editMode.value) {
      $p.openToolbar();
      $p.editMode.value = true;
    }

    if (extra.editorReady.value) {
      addDetail();
    } else {
      const stopWatch = watch(extra.editorReady, () => {
        if (extra.editorReady.value) {
          stopWatch();
          addDetail();
        }
      });
    }
  }

  async function modelBeforeUpdate(
    payload: UpdateDocActionPayload<
      HasParent extends false ? Expense | ExpenseVm : TParent | TParentVm
    >,
  ) {
    for (const action of modelBeforeUpdateActions.value) {
      await action(payload);
    }
  }

  // Watch

  watchEffect(() => {
    $p.collectionsHaveItems.value.details =
      (($p.editMode.value ? $p.viewModel.value?.details.length : $p.model.value?.details.length) ||
        0) > 0;
  });

  return {
    ...extra,
    mc,
    modelBeforeUpdateActions,
    validateExpenseAdditionEditor,
    isCompleted,
    addDetail: switchToEditModeAndAddDetail,
    modelBeforeUpdate,
  };
}

export function useExpenseNewPage<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string, hasParent?: HasParent, hitUseCount?: boolean) {
  type AllExtras = (HasParent extends false
    ? Record<never, never>
    : NewChildPage<ExpenseVm, TParentVm>) &
    ReturnType<typeof useChildPageNarrower<Expense, ExpenseVm, never, TParentVm>> &
    ReturnType<typeof useExpenseNewPageExtra<HasParent, TParentVm>>;

  // Composables

  const $p = useNewPage<ExpenseVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    hasParent === undefined &&
      (() => {
        throw new Error('hasParent not specified');
      })();

    hasParent && Object.assign($p, useNewChildPage<ExpenseVm, TParentVm>($p));
    Object.assign($p, useChildPageNarrower<Expense, ExpenseVm, never, TParentVm>());
    Object.assign($p, useExpenseNewPageExtra<HasParent, TParentVm>($p));

    expenseNewPageExtensions.forEach((value) => value<HasParent, TParentVm>($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export function useExpenseViewPage<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string, hasParent?: HasParent, hitUseCount?: boolean) {
  type AllExtras = (HasParent extends false
    ? Record<never, never>
    : ViewChildPage<Expense, ExpenseVm, TParent, TParentVm>) &
    ReturnType<typeof useChildPageNarrower<Expense, ExpenseVm, TParent, TParentVm>> &
    ReturnType<typeof useExpenseDetailsEditor> &
    ReturnType<typeof useCollectionsHaveItems> &
    ReturnType<typeof useTransactions> &
    ReturnType<typeof useExpenseViewPageExtra<HasParent, TParent, TParentVm>>;

  // Composables

  const $p = useViewPage<Expense, ExpenseVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    hasParent === undefined &&
      (() => {
        throw new Error('hasParent not specified');
      })();

    hasParent && Object.assign($p, useViewChildPage<Expense, ExpenseVm, TParent, TParentVm>($p));
    Object.assign($p, useChildPageNarrower<Expense, ExpenseVm, TParent, TParentVm>());
    Object.assign($p, useExpenseDetailsEditor($p));
    Object.assign($p, useCollectionsHaveItems());
    Object.assign($p, useTransactions($p));
    Object.assign($p, useExpenseViewPageExtra<HasParent, TParent, TParentVm>($p));

    expenseViewPageExtensions.forEach((value) => value<HasParent, TParent, TParentVm>($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export default function useExpenseEditPage<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useExpenseNewPage<HasParent, TParentVm>>,
    ReturnType<typeof useExpenseViewPage<HasParent, TParent, TParentVm>>
  >(scopeName);
}
