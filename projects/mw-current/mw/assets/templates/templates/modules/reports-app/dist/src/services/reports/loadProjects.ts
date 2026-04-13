import type { CollectionReference, QueryConstraint } from 'firebase/firestore';
import { collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';

import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';
import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';
import ProjectStatus_ProjectInvoices from 'utils/finance/Project/ProjectStatus_ProjectInvoices.js';
import QuotationStatus from 'utils/finance/Quotation/QuotationStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Project, ProjectAm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { getFirestore } from 'services/firebase.js';

export default async function loadProjects(
  startDate: Date,
  endDate: Date,
  ...queryConstraints: QueryConstraint[]
) {
  const db = getFirestore();
  const projectsRef = collection(db, 'finance_projects') as CollectionReference<ProjectAm>;
  const projectsQuery = query(
    projectsRef,
    where('finishDate', '>=', Timestamp.fromDate(startDate)),
    where('finishDate', '<=', Timestamp.fromDate(endDate)),
    orderBy('finishDate'),
    orderBy('name'),
    ...queryConstraints,
  );
  const projectsSnapshot = await getDocs(projectsQuery);
  const projectAndIds = projectsSnapshot.docs.map((projectSnapshot) => [
    projectSnapshot.data(),
    projectSnapshot.id,
  ]);
  const projectAms = projectAndIds.map((projectAndI) => projectAndI[0] as ProjectAm);
  const projectIdMap = new Map(projectAndIds as Iterable<readonly [ProjectAm, string]>);
  const extraArgs = () => ({ idMap: projectIdMap });
  const projects = financeMapper.mapArray<ProjectAm, Project>(projectAms, 'ProjectAm', 'Project', {
    extraArgs,
  });

  projects.forEach((project) => {
    project.statusHelper = new ProjectStatus_ProjectInvoices(project, []);

    project.quotations.forEach((quotation) => {
      quotation.statusHelper = new QuotationStatus(quotation, []);

      if (quotation.invoice) {
        quotation.invoice.statusHelper = new InvoiceStatus(quotation.invoice, []);

        quotation.invoice.transactions.forEach((transaction) => {
          transaction.statusHelper = new TransactionStatus(transaction, []);
        });
      }
    });

    project.expenses.forEach((expense) => {
      expense.statusHelper = new ExpenseStatus(expense, []);

      expense.transactions.forEach((transaction) => {
        transaction.statusHelper = new TransactionStatus(transaction, []);
      });
    });
  });

  return projects;
}
