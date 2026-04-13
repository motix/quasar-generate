import PayrollStatus from 'utils/hr/payroll/PayrollStatus.js';

import type { PayrollVm } from 'models/hr/index.js';

import { usePayrollsStore } from 'stores/hr/Payrolls.js';

export function seedPayrolls() {
  const store = usePayrollsStore();

  void store.createDoc({
    doc: {
      code: 'PR202503',
      year: 2025,
      month: 3,
      isCompleted: false,
      isApproved: false,
      isRejected: false,
      isCancelled: false,
      socialInsurancePercent: 0.105,
      unionDuesPercent: 0.005,
      workingDays: 22,
      details: [],
      statusHelper: new PayrollStatus({} as PayrollVm, []),
    },
  });
}
