import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { FinanceActionName, FinanceStatusName } from 'utils/finance/financeDocumentStatus.js';
import { buildFinanceStatuses } from 'utils/finance/financeDocumentStatus.js';

import type { Quotation, QuotationVm } from 'models/finance/index.js';
import type { UserRole } from 'models/firebase-auth/index.js';

declare module 'models/finance/quotations.js' {
  interface Quotation {
    statusHelper: QuotationStatus<Quotation>;
  }

  interface QuotationVm {
    statusHelper: QuotationStatus<QuotationVm>;
  }
}

export type QuotationActionName = Extract<
  'approve' | 'approveAndConfirm' | 'sendToCustomer' | 'confirm' | 'cancel' | 'reset',
  FinanceActionName
>;
export const quotationStatusNames = [
  'waitingForInitialApprovalAndConfirm',
  'waitingToSend',
  'waitingForConfirmation',
  'confirmed',
  'cancelled',
] as const;
export type QuotationStatusName = Extract<(typeof quotationStatusNames)[number], FinanceStatusName>;

export default class QuotationStatus<T extends Quotation | QuotationVm> extends DocumentStatusBase<
  T,
  UserRole,
  QuotationStatusName,
  QuotationActionName
> {
  allStatuses = buildFinanceStatuses<QuotationStatusName, QuotationActionName>(
    ...quotationStatusNames,
  );

  get statusName() {
    if (this.container.isCancelled) {
      return 'cancelled';
    }

    if (this.container.isApproved) {
      if (this.container.isSentToCustomer) {
        if (this.container.isConfirmed) {
          return 'confirmed';
        }

        return 'waitingForConfirmation';
      }

      return 'waitingToSend';
    }

    return 'waitingForInitialApprovalAndConfirm';
  }
}
