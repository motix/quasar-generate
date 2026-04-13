import { sumBy } from 'lodash-es';

import { pointTenRound } from 'utils/calculation.js';

import type { Expense, Invoice, Project, Quotation } from 'models/finance/index.js';

import useExpenseCalculator from 'composables/finance/expense/useExpenseCalculator.js';
import useInvoiceCalculator from 'composables/finance/invoice/useInvoiceCalculator.js';
import useFinanceProjectCalculator from 'composables/finance/project/useProjectCalculator.js';

export default function useProjectCalculator() {
  const pmc = useFinanceProjectCalculator<Project>();
  const imc = useInvoiceCalculator<Invoice>();
  const emc = useExpenseCalculator<Expense>();

  function projectTotalProductionSalary(project: Project) {
    return pmc.projectTotalProductionSalary(project);
  }

  function projectTotalVatExcludedInvoice(project: Project) {
    return sumBy<Quotation>(project.quotations, (value) =>
      value.invoice == null || !value.invoice.isCompleted || value.invoice.isCancelled
        ? 0
        : imc.invoiceVatExcludedTotal(value.invoice),
    );
  }

  function projectTotalInvoice(project: Project) {
    return sumBy<Quotation>(project.quotations, (value) =>
      value.invoice == null || !value.invoice.isCompleted || value.invoice.isCancelled
        ? 0
        : imc.invoiceTotal(value.invoice),
    );
  }

  function projectTotalExpense(project: Project) {
    return sumBy<Expense>(project.expenses, (value) =>
      !value.isCompleted || value.isCancelled ? 0 : emc.expenseTotal(value),
    );
  }

  function projectProductionRatio(project: Project) {
    const productionSalary = projectTotalProductionSalary(project);
    return productionSalary === 0
      ? undefined
      : pointTenRound(
          (projectTotalVatExcludedInvoice(project) - projectTotalExpense(project)) /
            productionSalary,
        );
  }

  function projectProfit(project: Project) {
    return (
      projectTotalVatExcludedInvoice(project) -
      projectTotalProductionSalary(project) -
      projectTotalExpense(project)
    );
  }

  function projectTotalReceipt(project: Project) {
    return sumBy<Quotation>(project.quotations, (value) =>
      value.invoice ? imc.invoiceTotalReceipt(value.invoice) : 0,
    );
  }

  function projectBalance(project: Project) {
    return projectTotalInvoice(project) - projectTotalReceipt(project);
  }

  return {
    projectTotalProductionSalary,
    projectTotalVatExcludedInvoice,
    projectTotalInvoice,
    projectTotalExpense,
    projectProductionRatio,
    projectProfit,
    projectTotalReceipt,
    projectBalance,
  };
}
