import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { date, uid } from 'quasar';

import assignOptional from 'utils/assignOptional.js';
import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';

import type { Invoice } from 'models/finance/index.js';

import { generateCode } from 'services/global/index.js';

import useQuotationViewPage from 'composables/finance/quotation/useQuotationViewPage.js';
import useNotifications from 'composables/useNotifications.js';

function useInvoicesExtra($p: ReturnType<typeof useQuotationViewPage>) {
  // Private

  const router = useRouter();

  const { notifyErrorDebug, notifyCreateDataError } = useNotifications();

  const invoiceGenerated = ref(false);

  // Data

  const generatingInvoice = ref(false);

  // Computed

  const hasGenerateInvoice = computed(
    () =>
      !!$p.model.value &&
      $p.model.value.invoice === undefined &&
      !$p.model.value.isCancelled &&
      $p.model.value.isApproved,
  );

  const showGenerateInvoiceButton = computed(
    () => !$p.readonlyMode.value && hasGenerateInvoice.value,
  );

  // Methods

  async function generateInvoice() {
    $p.freezed.value = true;
    generatingInvoice.value = true;

    const createDate = new Date();
    let code: string;
    try {
      code = await generateCode(
        'IV',
        date.formatDate(createDate, '.YY.MM.DD'),
        $p.pm.value.customer.code.toUpperCase(),
      );
    } catch (error) {
      console.error(error);
      notifyCreateDataError();
      notifyErrorDebug(error);

      generatingInvoice.value = false;
      $p.freezed.value = false;
      return;
    }

    class StatusClass extends InvoiceStatus<Invoice> {}

    const invoice = StatusClass.newContainer(
      StatusClass,
      assignOptional<Omit<Invoice, 'statusHelper'>>(
        {
          id: '_',
          isArchived: false,
          code,
          createDate,
          issueDate: $p.pm.value.finishDate,
          isRequired: $p.pm.value.isInvoiceRequired,
          isCompleted: false,
          isApproved: false,
          isRejected: false,
          isSentToCustomer: false,
          isCancelled: false,
          isCapitalContribution: false,
          isExternal: false,
          content: $p.pm.value.name,
          customer: $p.pm.value.customer,
          details:
            $p.m.value.details
              .filter((value) => !value.isProductionOnly && !value.isQuotationOnly)
              .map((value) => ({
                content: value.content,
                quantity: value.quantity,
                unitPrice: value.unitPrice as number,
              })) || [],
          transactions: $p.pm.value.quotations.flatMap(
            (quotation) =>
              quotation.invoice?.transactions.filter((transaction) => !transaction.isCancelled) ||
              [],
          ),
          listKey: uid(),
        },
        {
          discount: $p.m.value.discount,
          vatPercent: $p.m.value.vatPercent,
          vatableAmount: $p.m.value.vatableAmount,
        },
      ),
      [],
    );

    $p.pm.value.quotations.forEach(
      (quotation) =>
        quotation.invoice &&
        (quotation.invoice.transactions = quotation.invoice.transactions.filter(
          (transaction) => transaction.isCancelled,
        )),
    );

    generatingInvoice.value = false;
    $p.freezed.value = false;

    $p.m.value.invoice = invoice;
    invoiceGenerated.value = true;
  }

  // Watch

  $p.watchViewerAndRun(() => {
    if (!!$p.m.value.invoice && !!$p.parentModel.value) {
      void router.push(
        `/project-invoices/${
          $p.parentModel.value.urlFriendlyName
        }/${$p.m.value.invoice.code.replaceAll('.', '_')}`,
      );
    }
  }, invoiceGenerated);

  return {
    generatingInvoice,
    hasGenerateInvoice,
    showGenerateInvoiceButton,
    generateInvoice,
  };
}

export function extendQuotationViewPage_ProjectInvoices(
  $p: ReturnType<typeof useQuotationViewPage>,
) {
  $p.extraInitialized.value &&
    (() => {
      throw new Error('useQuotationViewPage has done initialization');
    })();

  const extension = {} as ReturnType<typeof useInvoicesExtra>;

  Object.assign(extension, useInvoicesExtra($p));
  Object.assign($p, extension);

  return extension;
}

export default function useQuotationViewPage_ProjectInvoices(scopeName: string) {
  const $p = useQuotationViewPage(scopeName);

  return $p as typeof $p & ReturnType<typeof extendQuotationViewPage_ProjectInvoices>;
}
