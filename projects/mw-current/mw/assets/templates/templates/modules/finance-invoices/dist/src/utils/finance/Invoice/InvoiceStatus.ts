import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { FinanceActionName, FinanceStatusName } from 'utils/finance/financeDocumentStatus.js';
import { buildFinanceStatuses } from 'utils/finance/financeDocumentStatus.js';

import type { Invoice, InvoiceVm } from 'models/finance/index.js';
import type { UserRole } from 'models/firebase-auth/index.js';

declare module 'models/finance/invoices.js' {
  interface Invoice {
    statusHelper: InvoiceStatus<Invoice>;
  }

  interface InvoiceVm {
    statusHelper: InvoiceStatus<InvoiceVm>;
  }
}

export type InvoiceActionName = Extract<
  'complete' | 'approve' | 'sendToCustomer' | 'cancel' | 'reset',
  FinanceActionName
>;
export const invoiceStatusNames = [
  'new',
  'waitingForApproval',
  'approved',
  'rejected',
  'waitingToSend',
  'sentToCustomer',
  'cancelled',
] as const;
export type InvoiceStatusName = Extract<(typeof invoiceStatusNames)[number], FinanceStatusName>;

export default class InvoiceStatus<T extends Invoice | InvoiceVm> extends DocumentStatusBase<
  T,
  UserRole,
  InvoiceStatusName,
  InvoiceActionName
> {
  allStatuses = buildFinanceStatuses<InvoiceStatusName, InvoiceActionName>(...invoiceStatusNames);

  get statusName() {
    if (this.container.isCancelled) {
      return 'cancelled';
    }

    if (this.container.isCompleted) {
      if (this.container.isApproved) {
        if (this.container.isRequired) {
          if (this.container.isSentToCustomer) {
            return 'sentToCustomer';
          }

          return 'waitingToSend';
        }

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
