import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { FinanceActionName, FinanceStatusName } from 'utils/finance/financeDocumentStatus.js';
import { buildFinanceStatuses } from 'utils/finance/financeDocumentStatus.js';

import type { Invoice, InvoiceVm, Project, ProjectVm } from 'models/finance/index.js';
import type { UserRole } from 'models/firebase-auth/index.js';

import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';

export type ProjectActionName = Extract<'', FinanceActionName>;
export const projectStatusNames = [
  'inProgress',
  'waitingForInvoice',
  'waitingForPayment',
  'done',
] as const;
export type ProjectStatusName = Extract<(typeof projectStatusNames)[number], FinanceStatusName>;

export default class ProjectStatus_ProjectInvoices<
  T extends Project | ProjectVm,
> extends DocumentStatusBase<T, UserRole, ProjectStatusName, ProjectActionName> {
  allStatuses = buildFinanceStatuses<ProjectStatusName, ProjectActionName>(...projectStatusNames);

  get statusName(): ProjectStatusName {
    const ic = useInvoiceCalculator<Invoice | InvoiceVm>();

    if (this.container.finishDate < new Date()) {
      if (this.container.isInvoiceRequired) {
        for (const quotation of this.container.quotations) {
          if (
            !!quotation.invoice &&
            !quotation.invoice.isCancelled &&
            quotation.invoice.isCompleted &&
            quotation.invoice.isApproved &&
            quotation.invoice.isSentToCustomer &&
            quotation.invoice.referenceNumber != null &&
            quotation.invoice.referenceNumber !== ''
          ) {
            if (ic.invoiceBalance(quotation.invoice) === 0) {
              return 'done';
            }

            return 'waitingForPayment';
          }
        }

        return 'waitingForInvoice';
      }

      for (const quotation of this.container.quotations) {
        if (
          !!quotation.invoice &&
          !quotation.invoice.isCancelled &&
          quotation.invoice.isCompleted &&
          quotation.invoice.isApproved
        ) {
          if (ic.invoiceBalance(quotation.invoice) === 0) {
            return 'done';
          }

          return 'waitingForPayment';
        }
      }

      return 'waitingForInvoice';
    }

    return 'inProgress';
  }
}
