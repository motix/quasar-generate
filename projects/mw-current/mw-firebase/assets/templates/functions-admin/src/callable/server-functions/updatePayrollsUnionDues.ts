// Already done. Do not run again.

import { info } from 'firebase-functions/logger';

import { collectionForeach } from 'utils/queryForeach.js';

import type { PayrollAm as Payroll } from 'models/hr/payrolls.js';

export default async function updatePayrollsUnionDues() {
  await collectionForeach<Payroll, Payroll>('hr_payrolls', async (docSnapshot) => {
    const payroll = docSnapshot.data();

    payroll.details.forEach((detail) => (detail.payUnionDues = false));

    info('[updatePayrollsUnionDues]', `Updating payroll "${docSnapshot.data().code}"...`);

    await docSnapshot.ref.update({ unionDuesPercent: 0.005, details: payroll.details });
  });
}
