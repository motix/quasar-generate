import onCallWithPermission from 'utils/onCallWithPermission.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type {
  ExpenseAm as Expense,
  InvoiceAm as Invoice,
  ProjectAm as Project,
  TransactionAm as Transaction,
} from 'models/finance/index.js';
import type { HealthCheckResult } from 'models/health/index.js';

// Finance Transactions unique code
export const transactionsUniqueCode = onCallWithPermission(['admin'], async () => {
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  let itemCount = 0;

  const projectInvoiceTransactionsCodeMap: Record<
    string,
    { projectId: string; quotationIndex: number; transactionIndex: number }
  > = {};

  const projectExpenseTransactionsCodeMap: Record<
    string,
    { projectId: string; expenseIndex: number; transactionIndex: number }
  > = {};

  await collectionForeach<Project>('finance_projects', (docSnapshot) => {
    docSnapshot.data().quotations.forEach((quotation, quotationIndex) => {
      if (!quotation.invoice) {
        return;
      }

      quotation.invoice.transactions.forEach((transaction, transactionIndex) => {
        itemCount++;

        const code = transaction.code;

        if (projectInvoiceTransactionsCodeMap[code] !== undefined) {
          errors.push(
            `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.transactions[${transactionIndex}]\` and \`finance_projects/{${projectInvoiceTransactionsCodeMap[code].projectId}}.quotations[${projectInvoiceTransactionsCodeMap[code].quotationIndex}].invoice.transactions[${projectInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
          );
        }

        if (projectExpenseTransactionsCodeMap[code] !== undefined) {
          errors.push(
            `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.transactions[${transactionIndex}]\` and \`finance_projects/{${projectExpenseTransactionsCodeMap[code].projectId}}.expenses[${projectExpenseTransactionsCodeMap[code].expenseIndex}].transactions[${projectExpenseTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
          );
        }

        projectInvoiceTransactionsCodeMap[code] = {
          projectId: docSnapshot.id,
          quotationIndex,
          transactionIndex,
        };
      });
    });

    docSnapshot.data().expenses.forEach((expense, expenseIndex) => {
      expense.transactions.forEach((transaction, transactionIndex) => {
        itemCount++;

        const code = transaction.code;

        if (projectInvoiceTransactionsCodeMap[code] !== undefined) {
          errors.push(
            `\`${docSnapshot.ref.path}.expenses[${expenseIndex}].transactions[${transactionIndex}]\` and \`finance_projects/{${projectInvoiceTransactionsCodeMap[code].projectId}}.quotations[${projectInvoiceTransactionsCodeMap[code].quotationIndex}].invoice.transactions[${projectInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
          );
        }

        if (projectExpenseTransactionsCodeMap[code] !== undefined) {
          errors.push(
            `\`${docSnapshot.ref.path}.expenses[${expenseIndex}].transactions[${transactionIndex}]\` and \`finance_projects/{${projectExpenseTransactionsCodeMap[code].projectId}}.expenses[${projectExpenseTransactionsCodeMap[code].expenseIndex}].transactions[${projectExpenseTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
          );
        }

        projectExpenseTransactionsCodeMap[code] = {
          projectId: docSnapshot.id,
          expenseIndex,
          transactionIndex,
        };
      });
    });

    return Promise.resolve();
  });

  const generalInvoiceTransactionsCodeMap: Record<
    string,
    { invoiceId: string; transactionIndex: number }
  > = {};

  await collectionForeach<Invoice>('finance_generalInvoices', (docSnapshot) => {
    docSnapshot.data().transactions.forEach((transaction, transactionIndex) => {
      itemCount++;

      const code = transaction.code;

      if (projectInvoiceTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.transactions[${transactionIndex}]\` and \`finance_projects/{${projectInvoiceTransactionsCodeMap[code].projectId}}.quotations[${projectInvoiceTransactionsCodeMap[code].quotationIndex}].invoice.transactions[${projectInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (projectExpenseTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.transactions[${transactionIndex}]\` and \`finance_projects/{${projectExpenseTransactionsCodeMap[code].projectId}}.expenses[${projectExpenseTransactionsCodeMap[code].expenseIndex}].transactions[${projectExpenseTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (generalInvoiceTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.transactions[${transactionIndex}]\` and \`finance_generalInvoices/{${generalInvoiceTransactionsCodeMap[code].invoiceId}}.transactions[${generalInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      generalInvoiceTransactionsCodeMap[code] = {
        invoiceId: docSnapshot.id,
        transactionIndex,
      };
    });

    return Promise.resolve();
  });

  const generalExpenseTransactionsCodeMap: Record<
    string,
    { expenseId: string; transactionIndex: number }
  > = {};

  await collectionForeach<Expense>('finance_generalExpenses', (docSnapshot) => {
    docSnapshot.data().transactions.forEach((transaction, transactionIndex) => {
      itemCount++;

      const code = transaction.code;

      if (projectInvoiceTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.transactions[${transactionIndex}]\` and \`finance_projects/{${projectInvoiceTransactionsCodeMap[code].projectId}}.quotations[${projectInvoiceTransactionsCodeMap[code].quotationIndex}].invoice.transactions[${projectInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (projectExpenseTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.transactions[${transactionIndex}]\` and \`finance_projects/{${projectExpenseTransactionsCodeMap[code].projectId}}.expenses[${projectExpenseTransactionsCodeMap[code].expenseIndex}].transactions[${projectExpenseTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (generalInvoiceTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.transactions[${transactionIndex}]\` and \`finance_generalInvoices/{${generalInvoiceTransactionsCodeMap[code].invoiceId}}.transactions[${generalInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (generalExpenseTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.transactions[${transactionIndex}]\` and \`finance_generalExpenses/{${generalExpenseTransactionsCodeMap[code].expenseId}}.transactions[${generalExpenseTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      generalInvoiceTransactionsCodeMap[code] = {
        invoiceId: docSnapshot.id,
        transactionIndex,
      };
    });

    return Promise.resolve();
  });

  await collectionForeach<Transaction>(
    'finance_generalTransactions',
    (docSnapshot, prevDocSnapshot) => {
      itemCount++;

      const code = docSnapshot.data().code;

      if (projectInvoiceTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`finance_projects/{${projectInvoiceTransactionsCodeMap[code].projectId}}.quotations[${projectInvoiceTransactionsCodeMap[code].quotationIndex}].invoice.transactions[${projectInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (projectExpenseTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`finance_projects/{${projectExpenseTransactionsCodeMap[code].projectId}}.expenses[${projectExpenseTransactionsCodeMap[code].expenseIndex}].transactions[${projectExpenseTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (generalInvoiceTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`finance_generalInvoices/{${generalInvoiceTransactionsCodeMap[code].invoiceId}}.transactions[${generalInvoiceTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (generalExpenseTransactionsCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`finance_generalExpenses/{${generalExpenseTransactionsCodeMap[code].expenseId}}.transactions[${generalExpenseTransactionsCodeMap[code].transactionIndex}]\` have the same \`code\` '\`${code}\`'`,
        );
      }

      if (!prevDocSnapshot) {
        return Promise.resolve();
      }

      if (code === prevDocSnapshot.data().code) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`${prevDocSnapshot.ref.path}\` have the same \`code\` '\`${code}\`'.`,
        );
      }

      return Promise.resolve();
    },
    'code',
  );

  if (errors.length === 0) {
    if (itemCount === 0) {
      info.push('There is no Transaction.');
    } else if (itemCount > 1) {
      successes.push(`\`code\`s are unique in all ${itemCount} Transactions.`);
    } else {
      info.push('There is only 1 Transaction.');
    }
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
});
