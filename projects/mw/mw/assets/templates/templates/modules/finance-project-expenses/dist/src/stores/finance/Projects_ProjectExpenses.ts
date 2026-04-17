import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import { storeOptions as projectsStoreOptions } from 'stores/finance/Projects.js';

let projectsStoreExtended = false;

export function extendProjectsStore() {
  if (projectsStoreExtended) {
    return;
  }

  const currentApiModelToModelAfterMap =
    projectsStoreOptions.mapperOptions?.apiModelToModelAfterMap;

  projectsStoreOptions.mapperOptions = {
    ...(projectsStoreOptions.mapperOptions || {}),

    apiModelToModelAfterMap: (source, destination) => {
      currentApiModelToModelAfterMap && currentApiModelToModelAfterMap(source, destination);

      destination.forEach((project) => {
        project.expenses.forEach((expense) => {
          expense.statusHelper = new ExpenseStatus(expense, []);

          expense.transactions.forEach((transaction) => {
            transaction.statusHelper = new TransactionStatus(transaction, []);
          });
        });
      });
    },
  };

  projectsStoreExtended = true;
}
