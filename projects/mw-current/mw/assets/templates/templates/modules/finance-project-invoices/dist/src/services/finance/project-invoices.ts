import { httpsCallable } from 'firebase/functions';

import type { InvoiceActionName } from 'utils/finance/Invoice/InvoiceStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changeProjectInvoiceStatus(
  projectId: string,
  code: string,
  action: InvoiceActionName,
) {
  const functions = getFunctions();
  const callable = httpsCallable<{ projectId: string; code: string; action: string }, void>(
    functions,
    'finance-changeProjectInvoiceStatus',
  );

  try {
    await callable({ projectId, code, action });
  } catch (error) {
    throw new Error('Calling to finance-changeProjectInvoiceStatus failed.', { cause: error });
  }
}
