import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';
import ProjectStatus_ProjectInvoices from 'utils/finance/Project/ProjectStatus_ProjectInvoices.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import { storeOptions } from 'stores/finance/Projects.js';

let projectsStoreExtended = false;

export function extendProjectsStore() {
  if (projectsStoreExtended) {
    return;
  }

  const currentApiModelToModelAfterMap = storeOptions.mapperOptions?.apiModelToModelAfterMap;

  storeOptions.mapperOptions = {
    ...(storeOptions.mapperOptions || {}),

    apiModelToModelAfterMap: (source, destination) => {
      currentApiModelToModelAfterMap && currentApiModelToModelAfterMap(source, destination);

      destination.forEach((project) => {
        project.statusHelper = new ProjectStatus_ProjectInvoices(project, []);

        project.quotations.forEach((quotation) => {
          if (quotation.invoice) {
            quotation.invoice.statusHelper = new InvoiceStatus(quotation.invoice, []);

            quotation.invoice.transactions.forEach((transaction) => {
              transaction.statusHelper = new TransactionStatus(transaction, []);
            });
          }
        });
      });
    },
  };

  const currentBeforeUpdate = storeOptions.beforeUpdate;

  storeOptions.beforeUpdate = async (payload) => {
    currentBeforeUpdate && (await currentBeforeUpdate(payload));

    payload.doc.quotations.forEach((value) => {
      if (value.invoice) {
        value.invoice.isRequired = payload.doc.isInvoiceRequired;
      }
    });
  };

  projectsStoreExtended = true;
}
