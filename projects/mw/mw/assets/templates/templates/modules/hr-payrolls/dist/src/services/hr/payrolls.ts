import { httpsCallable } from 'firebase/functions';

import type { PayrollActionName } from 'utils/hr/payroll/PayrollStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changePayrollStatus(id: string, action: PayrollActionName) {
  const functions = getFunctions();
  const callable = httpsCallable<{ id: string; action: string }, void>(
    functions,
    'hr-changePayrollStatus',
  );

  try {
    await callable({ id, action });
  } catch (error) {
    throw new Error('Calling to hr-changePayrollStatus failed.', { cause: error });
  }
}
