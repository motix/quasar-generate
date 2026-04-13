import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { HrActionName, HrStatusName } from 'utils/hr/hrDocumentStatus.js';
import { buildHrStatuses } from 'utils/hr/hrDocumentStatus.js';

import type { UserRole } from 'models/firebase-auth/index.js';
import type { Payroll, PayrollVm } from 'models/hr/index.js';

declare module 'models/hr/payrolls.js' {
  interface Payroll {
    statusHelper: PayrollStatus<Payroll>;
  }

  interface PayrollVm {
    statusHelper: PayrollStatus<PayrollVm>;
  }
}

export type PayrollActionName = HrActionName;
export type PayrollStatusName = HrStatusName;

export default class PayrollStatus<T extends Payroll | PayrollVm> extends DocumentStatusBase<
  T,
  UserRole,
  PayrollStatusName,
  PayrollActionName
> {
  allStatuses = buildHrStatuses('new', 'waitingForApproval', 'approved', 'rejected', 'cancelled');

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
