import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { FinanceActionName, FinanceStatusName } from 'utils/finance/financeDocumentStatus.js';
import { buildFinanceStatuses } from 'utils/finance/financeDocumentStatus.js';

import type { SalesContract, SalesContractVm } from 'models/finance/index.js';
import type { UserRole } from 'models/firebase-auth/index.js';

import useSalesContractCalculator from 'composables/finance/sales-contract/useSalesContractCalculator.js';

declare module 'models/finance/sales-contracts.js' {
  interface SalesContract {
    statusHelper: SalesContractStatus<SalesContract>;
  }

  interface SalesContractVm {
    statusHelper: SalesContractStatus<SalesContractVm>;
  }
}

export type SalesContractActionName = Extract<'', FinanceActionName>;
export const salesContractStatusNames = ['new', 'waitingForInvoice', 'done'] as const;
export type SalesContractStatusName = Extract<
  (typeof salesContractStatusNames)[number],
  FinanceStatusName
>;

export default class SalesContractStatus<
  T extends SalesContract | SalesContractVm,
> extends DocumentStatusBase<T, UserRole, SalesContractStatusName, SalesContractActionName> {
  allStatuses = buildFinanceStatuses<SalesContractStatusName, SalesContractActionName>(
    ...salesContractStatusNames,
  );

  protected mc = useSalesContractCalculator<T>();

  get statusName() {
    if (this.container.projects.length > 0 || this.container.generalInvoices.length > 0) {
      if (this.mc.salesContractBalance(this.container) === 0) {
        return 'done';
      }

      return 'waitingForInvoice';
    }

    return 'new';
  }
}
