import type { DocumentSnapshot } from 'firebase-admin/firestore';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import adapterUpdate from 'utils/adapterUpdate.js';
import generateProductionSalaries from 'utils/generateProductionSalaries.js';
import regenerateCode from 'utils/regenerateCode.js';

import type { ProjectAm as FinanceProject } from 'models/finance/index.js';
import type { ProjectAm as HrProject } from 'models/hr/index.js';
import type { ProjectAm as ProductionProject } from 'models/production/index.js';

import useProjectCalculator from 'composables/production/project/useProjectCalculator.js';

export const projectsAdapter = onDocumentWritten('production_projects/{id}', async (event) => {
  if (!event.data) {
    return;
  }

  const projectChange = event.data as Change<DocumentSnapshot<ProductionProject>>;
  const id = event.params.id;

  // Production to Finance

  const amc = useProjectCalculator<ProductionProject>();

  await adapterUpdate<ProductionProject, FinanceProject, never>(
    projectChange.after,
    id,
    'finance_projects',
    async (source, dest) => {
      const result = {
        isArchived: source.isArchived,
        name: source.name,
        urlFriendlyName: source.urlFriendlyName,
        customerContact: source.customerContact,
        owner: source.owner.fullName,
        finishDate: source.finishDate,
        customer: source.customer,
        items: dest
          ? [
              ...dest.items
                .filter(
                  (item) =>
                    item.isFinanceOnly ||
                    !!source.items.find((value) => value.title === item.title),
                )
                .map((item) => {
                  const sourceItem = source.items.find((value) => value.title === item.title);

                  if (sourceItem) {
                    return {
                      ...item,
                      title: sourceItem.title,
                      number: sourceItem.number || null,
                      description: sourceItem.description || null,
                      productType: sourceItem.productType.name,
                      quantity: sourceItem.quantity,
                      productionSalaryUnitPrice: amc.itemProductionSalaryUnitPrice(sourceItem),
                    };
                  }

                  return item;
                }),
              ...source.items
                .filter((item) => {
                  const destItem = dest.items.find((value) => value.title === item.title);

                  return !destItem || destItem.isFinanceOnly;
                })
                .map((item) => ({
                  isProductionOnly: false,
                  isFinanceOnly: false,
                  isQuotationOnly: false,
                  title: item.title,
                  number: item.number || null,
                  description: item.description || null,
                  productType: item.productType.name,
                  quantity: item.quantity,
                  productionSalaryUnitPrice: amc.itemProductionSalaryUnitPrice(item),
                })),
            ].sort((a, b) => {
              if (a.number) {
                if (b.number) {
                  if (a.number === b.number) {
                    return a.title > b.title ? 1 : -1;
                  }

                  return a.number > b.number ? 1 : -1;
                }

                return 1;
              }

              if (b.number) {
                return -1;
              }

              return a.title > b.title ? 1 : -1;
            })
          : source.items.map((item) => ({
              isProductionOnly: false,
              isFinanceOnly: false,
              isQuotationOnly: false,
              title: item.title,
              number: item.number || null,
              description: item.description || null,
              productType: item.productType.name,
              quantity: item.quantity,
              productionSalaryUnitPrice: amc.itemProductionSalaryUnitPrice(item),
            })),
        quotations: dest ? dest.quotations : [],
        expenses: dest ? dest.expenses : [],
        tasks: dest
          ? dest.tasks
          : {
              key: 'root',
              name: 'Root',
              folders: [],
              tasks: [],
            },
      };

      if (dest) {
        for (const quotation of result.quotations) {
          if (dest.customer.code !== source.customer.code) {
            quotation.code = await regenerateCode(
              quotation.code,
              source.customer.code.toUpperCase(),
            );
          }

          if (quotation.invoice) {
            quotation.invoice.issueDate = source.finishDate;
            quotation.invoice.content = source.name;

            if (quotation.invoice.customer.code !== source.customer.code) {
              quotation.invoice.code = await regenerateCode(
                quotation.invoice.code,
                source.customer.code.toUpperCase(),
              );

              for (const transaction of quotation.invoice.transactions) {
                transaction.code = await regenerateCode(
                  transaction.code,
                  source.customer.code.toUpperCase(),
                );
              }
            }

            quotation.invoice.customer = source.customer;
          }
        }

        for (const expense of result.expenses) {
          expense.issueDate = source.finishDate;
        }
      }

      return result;
    },
    (intersection) => ({
      ...intersection,
      isInvoiceRequired: true,
      quotations: [],
      expenses: [],
      tasks: {
        key: 'root',
        name: 'Root',
        folders: [],
        tasks: [],
      },
      rawSlackMessages: [],
      supplierIds: [],
      invoiceGroupIds: [],
      expenseGroupIds: [],
    }),
    'name',
  );

  // Production to HR

  await adapterUpdate<ProductionProject, HrProject, 'productionSalaries'>(
    projectChange.after,
    id,
    'hr_projects',
    (source) =>
      Promise.resolve({
        name: source.name,
        finishDate: source.finishDate,
        productionSalaries: generateProductionSalaries(source),
      }),
    (intersection) => intersection,
    'name',
  );
});
