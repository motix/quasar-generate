import liteDocsSyncedMainCollection from 'utils/health/liteDocsSyncedMainCollection.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type {
  InvoiceAm as Invoice,
  SalesContractAm as SalesContract,
} from 'models/finance/index.js';

// finance_salesContracts general invoices synced main
export const salesContractsGisSyncedMain = onCallWithPermission(['admin'], () => {
  let itemCount = 0;

  return liteDocsSyncedMainCollection<SalesContract, Invoice, 'generalInvoiceIds'>(
    'finance_salesContracts',
    'finance_generalInvoices',
    'generalInvoiceIds',
    [],
    {
      compare: (docSnapshot, mainDocSnapshots, fieldValue, errors) => {
        const invoiceIds = fieldValue;

        invoiceIds.forEach((invoiceId, index) => {
          itemCount++;

          const invoiceSnapshot = mainDocSnapshots.find((value) => value.id === invoiceId);

          if (!invoiceSnapshot) {
            errors.push(
              `\`${docSnapshot.ref.path}.generalInvoiceIds[${index}]\` '\`${invoiceId}\`' does not match any document in \`finance_generalInvoices\`.`,
            );
          }
        });
      },
      successMessage: () =>
        `All ${itemCount} item(s) in \`finance_salesContracts/{id}.generalInvoiceIds\` have a relevent document in \`finance_generalInvoices\`.`,
    },
  );
});
