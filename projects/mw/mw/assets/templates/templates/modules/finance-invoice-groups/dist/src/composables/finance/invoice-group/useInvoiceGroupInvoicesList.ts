import type { Ref } from 'vue';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { where } from 'firebase/firestore';

import { sortBy } from 'lodash-es';

import type { Invoice } from 'models/finance/index.js';

import { useInstantGeneralInvoicesStore } from 'stores/finance/GeneralInvoices.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useFormats from 'composables/useFormats.js';
import useNotifications from 'composables/useNotifications.js';

type Props = { invoiceGroupId: string };

export default function useInvoiceGroupInvoicesList<TParent extends NonNullable<unknown>>(
  props: Readonly<Props>,
) {
  // Private

  const router = useRouter();

  async function loadInvoices() {
    try {
      await loadInvoicesFromStore.value();

      invoicesReady.value = true;
    } catch (error) {
      console.error(error);
      notifyLoadDataError();
      notifyErrorDebug(error);
      invoicesReady.value = true;
    }
  }

  // Composables

  const f = useFormats();

  const { notifyErrorDebug, notifyLoadDataError } = useNotifications();

  const imc = useInvoiceCalculator<Invoice>();

  // Data

  const invoicesReady = ref(false);
  const invoiceRecords = ref(null) as Ref<
    | {
        invoice: Invoice;
        parent?: TParent;
      }[]
    | null
  >;

  // Method Refs

  const loadInvoicesFromStore = ref<() => Promise<void>>(async () => {
    const invoicesStore = useInstantGeneralInvoicesStore();

    await invoicesStore.loadAllDocs({
      queryConstraints: [where('group.id', '==', props.invoiceGroupId)],
    });

    // orderBy('issueDate', 'desc'),
    // orderBy('createDate'),
    invoiceRecords.value = sortBy(
      sortBy(
        // Casting is requried as DocumentStatus contains private fields
        // See https://github.com/vuejs/core/issues/2981
        (invoicesStore.docs as Invoice[]).map((invoice) => ({
          invoice,
        })),
        (record) => record.invoice.createDate,
      ).reverse(),
      (record) => record.invoice.issueDate,
    ).reverse();

    invoicesStore.$dispose();
  });

  const buidHasParentInvoiceLink = ref<((invoice: Invoice, parent: TParent) => string) | null>(
    null,
  );

  // Methods

  function onInvoiceClick(invoice: Invoice, parent?: TParent) {
    setTimeout(() => {
      void router.push(
        parent
          ? buidHasParentInvoiceLink.value?.(invoice, parent) ||
              (function () {
                throw new Error('[finance-expense-groups] buidHasParentInvoiceLink not set');
              })()
          : `/general-invoices/${invoice.code.replaceAll('.', '_')}`,
      );
    }, 300);
  }

  // Lifecycle Hooks

  onMounted(() => loadInvoices());

  // Watch

  watch(
    computed(() => props.invoiceGroupId),
    async () => {
      invoicesReady.value = false;
      invoiceRecords.value = null;

      await loadInvoices();
    },
  );

  return {
    f,
    imc,
    invoicesReady,
    invoiceRecords,
    loadInvoicesFromStore,
    buidHasParentInvoiceLink,
    onInvoiceClick,
  };
}
