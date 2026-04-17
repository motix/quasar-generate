import { uid } from 'quasar';

import { invoiceVmDefaultExtendedFields } from 'utils/finance/Invoice/InvoiceDefaultExtendedFields';
import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';

import type { InvoiceVm } from 'models/finance/index.js';

import { useGeneralInvoicesStore } from 'stores/finance/GeneralInvoices.js';

export function seedGeneralInvoices() {
  const store = useGeneralInvoicesStore();

  void store.createDoc({
    doc: {
      id: uid(),
      isArchived: false,
      code: 'IV.22.10.17-SBR',
      createDate: '17102022',
      issueDate: '17102022',
      isRequired: true,
      isCompleted: false,
      isApproved: false,
      isRejected: false,
      isSentToCustomer: false,
      isCancelled: false,
      isCapitalContribution: false,
      isExternal: false,
      customerExtraInfo: null,
      referenceNumber: null,
      content: 'Invoice for Sun Bright',
      discount: null,
      contractSubtotal: null,
      vatPercent: null,
      vatableAmount: null,
      secondVatPercent: null,
      secondVatableAmount: null,
      vatAdjustment: null,
      relocatedSubtotal: null,
      relocatedVat: null,
      notes: null,
      customer: {
        id: '_',
        code: 'sbr',
        name: 'Sun Bright',
      },
      details: [],
      transactions: [],
      listKey: null,
      statusHelper: new InvoiceStatus({} as InvoiceVm, []),
      ...invoiceVmDefaultExtendedFields(),
    },
  });
}
