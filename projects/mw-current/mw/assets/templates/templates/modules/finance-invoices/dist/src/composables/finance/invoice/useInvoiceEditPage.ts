import type { Component } from 'vue';
import { computed, ref, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { date, uid } from 'quasar';

import type { Invoice, InvoiceDetailVm, InvoiceVm, Transaction } from 'models/finance/index.js';

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
import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useCustomerOptions from 'composables/finance/shared/useCustomerOptions.js';
import useTransactionCalculator from 'composables/finance/transaction/useTransactionCalculator.js';
import { requiredConfigEntries } from 'composables/useConfig.js';
import useFormats from 'composables/useFormats.js';

export const invoiceNewPageExtensions: (<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ReturnType<typeof useInvoiceNewPage<HasParent, TParentVm>>,
) => void)[] = [];

export const invoiceViewPageExtensions: (<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ReturnType<typeof useInvoiceViewPage<HasParent, TParent, TParentVm>>,
) => void)[] = [];

export const invoiceEditPageComponentStore: {
  invoiceViewer: Component | null;
  invoiceEditorMain: Component | null;
} = {
  invoiceViewer: null,
  invoiceEditorMain: null,
};

function useInvoiceDetailsEditor($p: ViewPage<Invoice, InvoiceVm, NonNullable<unknown>>) {
  // Composables

  return useDetailsEditor<InvoiceVm, InvoiceDetailVm, []>(
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
  $p: ViewPage<Invoice, InvoiceVm, ReturnType<typeof useCollectionsHaveItems>>,
) {
  // Composables

  const router = useRouter();

  const tmc = useTransactionCalculator<Transaction>();

  // Method Refs

  const generateNewTransactionUrl = ref(
    () => `/general-invoice-transactions/${$p.m.value.code.replaceAll('.', '_')}/new`,
  );
  const generateViewTransactionUrl = ref(
    () => `/general-invoice-transactions/${$p.m.value.code.replaceAll('.', '_')}`,
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

function useInvoiceEditPageExtra(editMode: undefined | ViewPage<never, never>['editMode']) {
  // Composables

  const f = useFormats();

  const vmc = useInvoiceCalculator<InvoiceVm>();

  const { editorReady, editorDependenciesStores } = useEditorDependencies(editMode);

  const { customerOptions, customersEditorDependenciesStore, filterCustomerOptions } =
    useCustomerOptions();

  // Private Executions

  editorDependenciesStores.value = [customersEditorDependenciesStore];

  return {
    f,
    vmc,
    editorReady,
    editorDependenciesStores,
    customerOptions,
    filterCustomerOptions,
  };
}

function useInvoiceNewPageExtra<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>($p: NewPage<InvoiceVm, NonNullable<unknown>>) {
  // Composables

  const { editDateFormat } = requiredConfigEntries('editDateFormat');

  const extra = useInvoiceEditPageExtra(undefined);

  // Data

  const viewModelBeforeCreateActions = ref<
    ((
      payload: HasParent extends false
        ? CreateDocActionPayload<InvoiceVm>
        : UpdateDocActionPayload<TParentVm>,
    ) => Promise<void>)[]
  >([
    async () => {
      $p.vm.value.customer === undefined &&
        (() => {
          throw new Error('customer not specified');
        })();

      $p.vm.value.code = await generateCode(
        'IV',
        date.formatDate(date.extractDate($p.vm.value.createDate, editDateFormat), '.YY.MM.DD'),
        $p.vm.value.customer.code.toUpperCase(),
      );
    },
  ]);

  // Methods

  async function viewModelBeforeCreate(
    payload: HasParent extends false
      ? CreateDocActionPayload<InvoiceVm>
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

function useInvoiceViewPageExtra<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(
  $p: ViewPage<
    Invoice,
    InvoiceVm,
    ReturnType<typeof useInvoiceDetailsEditor> & ReturnType<typeof useCollectionsHaveItems>
  >,
) {
  // Private

  const addDetail = $p.addDetail;

  // Composables

  const extra = useInvoiceEditPageExtra($p.editMode);

  const mc = useInvoiceCalculator<Invoice>();

  // Data

  const modelBeforeUpdateActions = ref<
    ((
      payload: UpdateDocActionPayload<
        HasParent extends false ? Invoice | InvoiceVm : TParent | TParentVm
      >,
    ) => Promise<void>)[]
  >([
    async (payload) => {
      if (!payload.isViewModel) {
        return;
      }

      !$p.vm.value.customer &&
        (() => {
          throw new Error('customer not specified');
        })();

      if (!extra.f.isNumber($p.vm.value.vatPercent)) {
        $p.vm.value.vatableAmount = '';
        $p.vm.value.secondVatPercent = '';
        $p.vm.value.secondVatableAmount = '';
        $p.vm.value.vatAdjustment = '';
      }

      if (
        !$p.deleting.value && // When deleting child page, model is reassigned to another child or null
        $p.vm.value.customer.code !== $p.m.value.customer.code
      ) {
        $p.vm.value.code = await regenerateCode(
          $p.vm.value.code,
          $p.vm.value.customer.code.toUpperCase(),
        );

        for (const transaction of $p.vm.value.transactions) {
          transaction.code = await regenerateCode(
            transaction.code,
            $p.vm.value.customer.code.toUpperCase(),
          );
        }
      }
    },
  ]);

  // Method Refs

  const validateInvoiceAdditionEditor = ref<(() => Promise<boolean>) | null>(null);

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
      HasParent extends false ? Invoice | InvoiceVm : TParent | TParentVm
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
    validateInvoiceAdditionEditor,
    isCompleted,
    addDetail: switchToEditModeAndAddDetail,
    modelBeforeUpdate,
  };
}

export function useInvoiceNewPage<
  HasParent extends boolean,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string, hasParent?: HasParent, hitUseCount?: boolean) {
  type AllExtras = (HasParent extends false
    ? Record<never, never>
    : NewChildPage<InvoiceVm, TParentVm>) &
    ReturnType<typeof useChildPageNarrower<Invoice, InvoiceVm, never, TParentVm>> &
    ReturnType<typeof useInvoiceNewPageExtra<HasParent, TParentVm>>;

  // Composables

  const $p = useNewPage<InvoiceVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    hasParent === undefined &&
      (() => {
        throw new Error('hasParent not specified');
      })();

    hasParent && Object.assign($p, useNewChildPage<InvoiceVm, TParentVm>($p));
    Object.assign($p, useChildPageNarrower<Invoice, InvoiceVm, never, TParentVm>());
    Object.assign($p, useInvoiceNewPageExtra<HasParent, TParentVm>($p));

    invoiceNewPageExtensions.forEach((value) => value<HasParent, TParentVm>($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export function useInvoiceViewPage<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string, hasParent?: HasParent, hitUseCount?: boolean) {
  type AllExtras = (HasParent extends false
    ? Record<never, never>
    : ViewChildPage<Invoice, InvoiceVm, TParent, TParentVm>) &
    ReturnType<typeof useChildPageNarrower<Invoice, InvoiceVm, TParent, TParentVm>> &
    ReturnType<typeof useInvoiceDetailsEditor> &
    ReturnType<typeof useCollectionsHaveItems> &
    ReturnType<typeof useTransactions> &
    ReturnType<typeof useInvoiceViewPageExtra<HasParent, TParent, TParentVm>>;

  // Composables

  const $p = useViewPage<Invoice, InvoiceVm, AllExtras>(scopeName, hitUseCount);

  // Private Executions

  if (!$p.extraInitialized.value) {
    hasParent === undefined &&
      (() => {
        throw new Error('hasParent not specified');
      })();

    hasParent && Object.assign($p, useViewChildPage<Invoice, InvoiceVm, TParent, TParentVm>($p));
    Object.assign($p, useChildPageNarrower<Invoice, InvoiceVm, TParent, TParentVm>());
    Object.assign($p, useInvoiceDetailsEditor($p));
    Object.assign($p, useCollectionsHaveItems());
    Object.assign($p, useTransactions($p));
    Object.assign($p, useInvoiceViewPageExtra<HasParent, TParent, TParentVm>($p));

    invoiceViewPageExtensions.forEach((value) => value<HasParent, TParent, TParentVm>($p));

    $p.extraInitialized.value = true;
  }

  return $p;
}

export default function useInvoiceEditPage<
  HasParent extends boolean,
  TParent extends HasParent extends false ? never : NonNullable<unknown>,
  TParentVm extends HasParent extends false ? never : NonNullable<unknown>,
>(scopeName: string) {
  return useCustomizedEditPage<
    ReturnType<typeof useInvoiceNewPage<HasParent, TParentVm>>,
    ReturnType<typeof useInvoiceViewPage<HasParent, TParent, TParentVm>>
  >(scopeName);
}
