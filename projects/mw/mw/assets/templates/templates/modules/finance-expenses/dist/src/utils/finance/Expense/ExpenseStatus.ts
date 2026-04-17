import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { FinanceActionName, FinanceStatusName } from 'utils/finance/financeDocumentStatus.js';
import { buildFinanceStatuses } from 'utils/finance/financeDocumentStatus.js';

import type { Expense, ExpenseVm } from 'models/finance/index.js';
import type { UserRole } from 'models/firebase-auth/index.js';

declare module 'models/finance/expenses.js' {
  interface Expense {
    statusHelper: ExpenseStatus<Expense>;
  }
  interface ExpenseVm {
    statusHelper: ExpenseStatus<ExpenseVm>;
  }
}

export type ExpenseActionName = Extract<
  'complete' | 'approve' | 'cancel' | 'reset',
  FinanceActionName
>;
export const expenseStatusNames = [
  'new',
  'waitingForApproval',
  'approved',
  'rejected',
  'cancelled',
] as const;
export type ExpenseStatusName = Extract<(typeof expenseStatusNames)[number], FinanceStatusName>;

export default class ExpenseStatus<T extends Expense | ExpenseVm> extends DocumentStatusBase<
  T,
  UserRole,
  ExpenseStatusName,
  ExpenseActionName
> {
  allStatuses = buildFinanceStatuses<ExpenseStatusName, ExpenseActionName>(...expenseStatusNames);

  get statusName() {
    if (this.container.isCancelled) {
      return 'cancelled';
    }

    if (this.container.isCompleted) {
      if (this.container.isApproved) {
        return 'approved';
      }

      return 'waitingForApproval';
    }

    if (this.container.isRejected) {
      return 'rejected';
    }

    return 'new';
  }
}
