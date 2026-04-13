import { httpsCallable } from 'firebase/functions';

import type { InvoiceActionName } from 'utils/finance/Invoice/InvoiceStatus.js';
import type { TransactionActionName } from 'utils/finance/Transaction/TransactionStatus.js';

import { getFunctions } from 'services/firebase.js';

export async function changeGeneralInvoiceStatus(id: string, action: InvoiceActionName) {
  const functions = getFunctions();
  const callable = httpsCallable<{ id: string; action: string }, void>(
    functions,
    'finance-changeGeneralInvoiceStatus',
  );

  try {
    await callable({ id, action });
  } catch (error) {
    throw new Error('Calling to finance-changeGeneralInvoiceStatus failed.', { cause: error });
  }
}

export async function changeGeneralInvoiceTransactionStatus(
  invoiceId: string,
  code: string,
  action: TransactionActionName,
) {
  const functions = getFunctions();
  const callable = httpsCallable<{ invoiceId: string; code: string; action: string }, void>(
    functions,
    'finance-changeGeneralInvoiceTransactionStatus',
  );

  try {
    await callable({ invoiceId, code, action });
  } catch (error) {
    throw new Error('Calling to finance-changeGeneralInvoiceTransactionStatus failed.', {
      cause: error,
    });
  }
}
