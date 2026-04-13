import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Invoice, InvoiceAm, InvoiceVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import type { StoreOptions } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';

// Export storeOptions to allow extending from other modules
export const storeOptions: StoreOptions<Invoice, InvoiceVm, InvoiceAm> = {
  mapperOptions: {
    apiModelToModelAfterMap: (_, destinations) => {
      destinations.forEach((invoice) => {
        invoice.statusHelper = new InvoiceStatus(invoice, []);

        invoice.transactions.forEach((transaction) => {
          transaction.statusHelper = new TransactionStatus(transaction, []);
        });
      });
    },
  },
};

export const useGeneralInvoicesStore = useStore<Invoice, InvoiceVm, InvoiceAm>(
  'GeneralInvoices',
  'finance_generalInvoices',
  financeMapper,
  'Invoice',
  'InvoiceVm',
  'InvoiceAm',
  storeOptions,
);

export function useInstantGeneralInvoicesStore() {
  return useStore<Invoice, InvoiceVm, InvoiceAm>(
    `InstantGeneralInvoices_${uid()}`,
    'finance_generalInvoices',
    financeMapper,
    'Invoice',
    'InvoiceVm',
    'InvoiceAm',
    storeOptions,
  )();
}

export const generalInvoicesStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('issueDate', 'desc'),
  orderBy('createDate'),
];
