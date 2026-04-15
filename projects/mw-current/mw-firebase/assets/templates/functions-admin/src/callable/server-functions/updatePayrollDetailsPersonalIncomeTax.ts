// Already done. Do not run again.

import { info } from 'firebase-functions/logger';

import { collectionForeach } from 'utils/queryForeach.js';

import type { PayrollAm as Payroll } from 'models/hr/payrolls.js';

export default async function updatePayrollDetailsPersonalIncomeTax() {
  await collectionForeach<Payroll, Payroll>('hr_payrolls', async (docSnapshot) => {
    const payroll = docSnapshot.data();

    payroll.details.forEach((detail) => (detail.personalIncomeTax = 0));

    info('[updatePayrollDetailsPersonalIncomeTax]', `Updating payroll "${payroll.code}"...`);

    await docSnapshot.ref.update({ details: payroll.details });
  });
}
