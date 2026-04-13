import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { InvoiceGroup, InvoiceGroupAm, InvoiceGroupVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export const useInvoiceGroupsStore = useStore<InvoiceGroup, InvoiceGroupVm, InvoiceGroupAm>(
  'InvoiceGroups',
  'finance_invoiceGroups',
  financeMapper,
  'InvoiceGroup',
  'InvoiceGroupVm',
  'InvoiceGroupAm',
);

export const invoiceGroupsStoreDefaultSort: Readonly<QueryConstraint[]> = [orderBy('name')];
