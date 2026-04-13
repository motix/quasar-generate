import { httpsCallable } from 'firebase/functions';

import type { QuotationActionName } from 'utils/finance/Quotation/QuotationStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changeQuotationStatus(
  projectId: string,
  code: string,
  action: QuotationActionName,
) {
  const functions = getFunctions();
  const callable = httpsCallable<{ projectId: string; code: string; action: string }, void>(
    functions,
    'finance-changeQuotationStatus',
  );

  try {
    await callable({ projectId, code, action });
  } catch (error) {
    throw new Error('Calling to finance-changeQuotationStatus failed.', { cause: error });
  }
}
