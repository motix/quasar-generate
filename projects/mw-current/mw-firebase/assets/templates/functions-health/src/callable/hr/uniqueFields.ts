import uniqueField from 'utils/health/uniqueField.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

import type { PayrollAm as Payroll } from 'models/hr/index.js';

export const payrollsUniqueCode = onCallWithPermission(['admin'], () => {
  return uniqueField<Payroll>('hr_payrolls', 'code');
});
