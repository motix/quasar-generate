import type { QueryConstraint } from 'firebase/firestore';
import { orderBy, Timestamp, where } from 'firebase/firestore';

import { uniqBy } from 'lodash-es';

import type { SalesContract } from 'models/finance/index.js';

import { useInstantSalesContractsStore } from 'stores/finance/SalesContracts.js';

async function loadSalesContracts(
  store: ReturnType<typeof useInstantSalesContractsStore>,
  startVatInvoiceIssueDate: Date,
  endVatInvoiceIssueDate: Date,
  length: number,
  ...queryConstraints: QueryConstraint[]
) {
  await store.loadAllDocs({
    queryConstraints: [
      where('vatInvoiceIssueDateLength', '==', length),
      where(
        'firstVatInvoiceIssueDate',
        '>=',
        Timestamp.fromDate(
          new Date(
            startVatInvoiceIssueDate.getFullYear() - length,
            startVatInvoiceIssueDate.getMonth(),
            startVatInvoiceIssueDate.getDate(),
          ),
        ),
      ),
      where('firstVatInvoiceIssueDate', '<=', Timestamp.fromDate(endVatInvoiceIssueDate)),
      orderBy('firstVatInvoiceIssueDate'),
      ...queryConstraints,
    ],
  });
}

export default async function loadSalesContractsByVatInvoice(
  startVatInvoiceIssueDate: Date,
  endVatInvoiceIssueDate: Date,
  ...queryConstraints: QueryConstraint[]
) {
  let salesContracts: SalesContract[];
  const salesContractsStore = useInstantSalesContractsStore();

  await loadSalesContracts(
    salesContractsStore,
    startVatInvoiceIssueDate,
    endVatInvoiceIssueDate,
    1,
    ...queryConstraints,
  );
  // Casting is requried as DocumentStatus contains private fields
  // See https://github.com/vuejs/core/issues/2981
  salesContracts = salesContractsStore.docs as SalesContract[];
  salesContractsStore.releaseDocs({ immediately: true });

  await loadSalesContracts(
    salesContractsStore,
    startVatInvoiceIssueDate,
    endVatInvoiceIssueDate,
    2,
    ...queryConstraints,
  );
  salesContracts = [
    ...salesContracts,
    // Casting is requried as DocumentStatus contains private fields
    // See https://github.com/vuejs/core/issues/2981
    ...(salesContractsStore.docs as SalesContract[]),
  ];
  salesContractsStore.releaseDocs({ immediately: true });

  await loadSalesContracts(
    salesContractsStore,
    startVatInvoiceIssueDate,
    endVatInvoiceIssueDate,
    3,
    ...queryConstraints,
  );
  salesContracts = [
    ...salesContracts,
    // Casting is requried as DocumentStatus contains private fields
    // See https://github.com/vuejs/core/issues/2981
    ...(salesContractsStore.docs as SalesContract[]),
  ];

  salesContractsStore.$dispose();

  salesContracts = uniqBy(salesContracts, (value) => value.id);

  return salesContracts;
}
