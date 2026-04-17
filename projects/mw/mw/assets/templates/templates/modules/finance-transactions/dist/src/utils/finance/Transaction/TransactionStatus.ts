import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { FinanceActionName, FinanceStatusName } from 'utils/finance/financeDocumentStatus.js';
import { buildFinanceStatuses } from 'utils/finance/financeDocumentStatus.js';

import type { Transaction, TransactionVm } from 'models/finance/index.js';
import type { UserRole } from 'models/firebase-auth/index.js';

declare module 'models/finance/transactions.js' {
  interface Transaction {
    statusHelper: TransactionStatus<Transaction>;
  }

  interface TransactionVm {
    statusHelper: TransactionStatus<TransactionVm>;
  }
}

export type TransactionActionName = Extract<'clear' | 'cancel' | 'reset', FinanceActionName>;
export const transactionStatusNames = ['pending', 'cleared', 'cancelled'] as const;
export type TransactionStatusName = Extract<
  (typeof transactionStatusNames)[number],
  FinanceStatusName
>;

export default class TransactionStatus<
  T extends Transaction | TransactionVm,
> extends DocumentStatusBase<T, UserRole, TransactionStatusName, TransactionActionName> {
  allStatuses = buildFinanceStatuses<TransactionStatusName, TransactionActionName>(
    ...transactionStatusNames,
  );

  get statusName() {
    if (this.container.isCancelled) {
      return 'cancelled';
    }

    if (this.container.isCleared) {
      return 'cleared';
    }

    return 'pending';
  }
}
