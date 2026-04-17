import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { uid } from 'quasar';

import type { Transaction, TransactionDetailVm, TransactionVm } from 'models/finance/index.js';
import { transactionTypes } from 'models/finance/index.js';

import useDetailsEditor from 'composables/crud-pages/useDetailsEditor.js';
import useEditorDependencies from 'composables/crud-pages/useEditorDependencies.js';
import { useCustomizedEditPage } from 'composables/crud-pages/useEditPage.js';
import type { NewChildPage } from 'composables/crud-pages/useNewChildPage.js';
import useNewChildPage from 'composables/crud-pages/useNewChildPage.js';
import useNewPage from 'composables/crud-pages/useNewPage/index.js';
import { useChildPageNarrower } from 'composables/crud-pages/usePageNarrower.js';
import type { ViewChildPage } from 'composables/crud-pages/useViewChildPage.js';
import useViewChildPage from 'composables/crud-pages/useViewChildPage.js';
import type { ViewPage } from 'composables/crud-pages/useViewPage/index.js';
import useViewPage from 'composables/crud-pages/useViewPage/index.js';
import useFinanceAccountOptions from 'composables/finance/shared/useFinanceAccountOptions.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import useFormats from 'composables/useFormats.js';

export const transactionNewPageExtensions: (<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ReturnType<typeof useTransactionNewPage<HasParent, TParentVm>>,
) => void)[] = [];

export const transactionViewPageExtensions: (<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ReturnType<typeof useTransactionViewPage<HasParent, TParent, TParentVm>>,
) => void)[] = [];

function useTransactionDetailsEditor(
  $p: ViewPage<Transaction, TransactionVm, NonNullable<unknown>>,
) {
  // Composables

  return useDetailsEditor<TransactionVm, TransactionDetailVm, []>(
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

function useTransactionEditPageExtra(editMode: undefined | ViewPage<never, never>['editMode']) {
  // Composables

  const f = useFormats();

  const vmc = useTransactionCalculator<TransactionVm>();

  const { editorReady, editorDependenciesStores } = useEditorDependencies(editMode);

  const {
    financeAccountOptions,
    financeAccountsEditorDependenciesStore,
    filterFinanceAccountOptions,
  } = useFinanceAccountOptions();

  // Data

  const hasCustomer = ref(false);
  const hasSupplier = ref(false);

  // Computed

  const transactionTypeOptions = computed(() => [
    ...transactionTypes.filter((value) => {
      const transaction = { type: value } as TransactionVm;

      if (hasCustomer.value) {
        return vmc.transactionHasCustomer(transaction);
      }

      if (hasSupplier.value) {
        return vmc.transactionHasSupplier(transaction);
      }

      return !vmc.transactionHasCustomer(transaction) && !vmc.transactionHasSupplier(transaction);
    }),
  ]);

  // Private Executions

  editorDependenciesStores.value = [financeAccountsEditorDependenciesStore];

  return {
    f,
    vmc,
    editorReady,
    editorDependenciesStores,
    financeAccountOptions,
    hasCustomer,
    hasSupplier,
    transactionTypeOptions,
    filterFinanceAccountOptions,
  };
}

function useTransactionNewPageExtra() {
  // Composables

  const route = useRoute();

  const extra = useTransactionEditPageExtra(undefined);

  // Data

  const directParentFindKey = ref(
    ((route.params.directParentFindKey as string) || '').replaceAll('_', '.'),
  );

  return {
    ...extra,
    directParentFindKey,
  };
}

function useTransactionViewPageExtra(
  $p: ViewPage<
    Transaction,
    TransactionVm,
    ReturnType<typeof useTransactionDetailsEditor> &
      ReturnType<typeof useChildPageNarrower<Transaction, TransactionVm, never, never>>
  >,
) {
  // Private

  const addDetail = $p.addDetail;

  // Composables

  const extra = useTransactionEditPageExtra($p.editMode);

  const mc = useTransactionCalculator<Transaction>();

  // Data

  const fillDetailsFromParentButtonLabel = ref('Fill Details from Parent');

  // Method Refs

  const fillDetailsFromParent = ref(() => {
    // Do nothing
  });

  // Computed

  const hasDetails = computed(
    () =>
      (($p.editMode.value ? $p.viewModel.value?.details.length : $p.model.value?.details.length) ||
        0) > 0,
  );

  const showFillDetailsFromParentButton = computed(() => $p.hasParent($p) && $p.editMode.value);

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

  return {
    ...extra,
    mc,
    fillDetailsFromParentButtonLabel,
    fillDetailsFromParent,
    hasDetails,
    showFillDetailsFromParentButton,
    addDetail: switchToEditModeAndAddDetail,
  };
}

export function useTransactionNewPage<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string, hasParent?: HasParent, hitUseCount?: boolean) {
  type AllExtras = (HasParent extends false
    ? Record<never, never>
    : NewChildPage<TransactionVm, TParentVm>) &
    ReturnType<typeof useChildPageNarrower<Transaction, TransactionVm, never, TParentVm>> &
    ReturnType<typeof useTransactionNewPageExtra>;

  // Composables

  const $p = useNewPage<TransactionVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    hasParent === undefined &&
      (() => {
        throw new Error('hasParent not specified');
      })();

    hasParent && Object.assign($p, useNewChildPage<TransactionVm, TParentVm>($p));
    Object.assign($p, useChildPageNarrower<Transaction, TransactionVm, never, TParentVm>());
    Object.assign($p, useTransactionNewPageExtra());

    transactionNewPageExtensions.forEach((value) => value($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export function useTransactionViewPage<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string, hasParent?: HasParent, hitUseCount?: boolean) {
  type AllExtras = (HasParent extends false
    ? Record<never, never>
    : ViewChildPage<Transaction, TransactionVm, TParent, TParentVm>) &
    ReturnType<typeof useChildPageNarrower<Transaction, TransactionVm, TParent, TParentVm>> &
    ReturnType<typeof useTransactionDetailsEditor> &
    ReturnType<typeof useTransactionViewPageExtra>;

  // Composables

  const $p = useViewPage<Transaction, TransactionVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    hasParent === undefined &&
      (() => {
        throw new Error('hasParent not specified');
      })();

    hasParent &&
      Object.assign($p, useViewChildPage<Transaction, TransactionVm, TParent, TParentVm>($p));
    Object.assign($p, useChildPageNarrower<Transaction, TransactionVm, TParent, TParentVm>());
    Object.assign($p, useTransactionDetailsEditor($p));
    Object.assign($p, useTransactionViewPageExtra($p));

    transactionViewPageExtensions.forEach((value) => value($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export default function useTransactionEditPage<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useTransactionNewPage<HasParent, TParentVm>>,
    ReturnType<typeof useTransactionViewPage<HasParent, TParent, TParentVm>>
  >(scopeName);
}
