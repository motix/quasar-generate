// Already done. Do not run again.

import { info } from 'firebase-functions/logger';

import { collectionForeach } from 'utils/queryForeach.js';

import type { ExpenseAm as Expense } from 'models/finance/expenses.js';
import type { InvoiceAm as Invoice } from 'models/finance/invoices.js';
import type { ProjectAm as Project } from 'models/finance/projects.js';
import type { PayrollAm as Payroll } from 'models/hr/payrolls.js';

export default async function updateDocsIsRejected() {
  await collectionForeach<Payroll, Payroll>('hr_payrolls', async (docSnapshot) => {
    info('[updateDocsIsRejected]', `Updating payroll "${docSnapshot.data().code}"...`);

    await docSnapshot.ref.update({ isRejected: false });
  });

  await collectionForeach<Invoice, Invoice>('finance_generalInvoices', async (docSnapshot) => {
    info(
      '[updateDocsIsRejected]',
      `Updating general invoice "${docSnapshot.data().code}" (${docSnapshot.data().content})...`,
    );

    await docSnapshot.ref.update({ isRejected: false });
  });

  await collectionForeach<Expense, Expense>('finance_generalExpenses', async (docSnapshot) => {
    info(
      '[updateDocsIsRejected]',
      `Updating general expense "${docSnapshot.data().code}" (${docSnapshot.data().content})...`,
    );

    await docSnapshot.ref.update({ isRejected: false });
  });

  await collectionForeach<Project, Project>('finance_projects', async (docSnapshot) => {
    const project = docSnapshot.data();

    project.quotations.forEach((quotation) => {
      if (quotation.invoice) {
        quotation.invoice.isRejected = false;
      }
    });

    project.expenses.forEach((expense) => (expense.isRejected = false));

    info('[updateDocsIsRejected]', `Updating project "${docSnapshot.data().name}"...`);

    await docSnapshot.ref.update({
      quotations: project.quotations,
      expenses: project.expenses,
    });
  });
}
