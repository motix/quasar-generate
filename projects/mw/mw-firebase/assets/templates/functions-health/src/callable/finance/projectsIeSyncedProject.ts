import onCallWithPermission from 'utils/onCallWithPermission.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { ProjectAm as Project } from 'models/finance/index.js';
import type { HealthCheckResult } from 'models/health/index.js';

// finance_projects invoices, expenses synced project
export const projectsIeSyncedProject = onCallWithPermission(['admin'], async () => {
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  const collectionPath = 'finance_projects';

  let hasProject = false;

  await collectionForeach<Project>(collectionPath, (docSnapshot) => {
    hasProject = true;

    const project = docSnapshot.data();

    project.quotations.forEach((quotation, quotationIndex) => {
      const invoice = quotation.invoice;

      if (invoice) {
        if (!invoice.issueDate.isEqual(project.finishDate)) {
          errors.push(
            `\`${
              docSnapshot.ref.path
            }.quotations[${quotationIndex}].invoice.issueDate\`'s value \`${invoice.issueDate
              .toDate()
              .toString()}\` not matched with project's \`finishDate\`'s value \`${project.finishDate
              .toDate()
              .toString()}\`. Project: \`${project.name}\`.`,
          );
        }

        if (invoice.isRequired !== project.isInvoiceRequired) {
          errors.push(
            `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.isRequired\`'s value \`${invoice.isRequired}\` not matched with project's \`isInvoiceRequired\`'s value \`${project.isInvoiceRequired}\`. Project: \`${project.name}\`.`,
          );
        }

        if (invoice.content !== project.name) {
          errors.push(
            `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.content\`'s value \`${invoice.content}\` not matched with project's \`name\`'s value \`${project.name}\`. Project: \`${project.name}\`.`,
          );
        }

        if (invoice.customer.id !== project.customer.id) {
          errors.push(
            `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.customer.id\`'s value \`${invoice.customer.id}\` not matched with project's \`customer.id\`'s value \`${project.customer.id}\`. Project: \`${project.name}\`.`,
          );
        }

        if (invoice.customer.code !== project.customer.code) {
          errors.push(
            `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.customer.code\`'s value \`${invoice.customer.code}\` not matched with project's \`customer.code\`'s value \`${project.customer.code}\`. Project: \`${project.name}\`.`,
          );
        }

        if (invoice.customer.name !== project.customer.name) {
          errors.push(
            `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice.customer.name\`'s value \`${invoice.customer.name}\` not matched with project's \`customer.name\`'s value \`${project.customer.name}\`. Project: \`${project.name}\`.`,
          );
        }
      }
    });

    project.expenses.forEach((expense, expenseIndex) => {
      if (!expense.issueDate.isEqual(project.finishDate)) {
        errors.push(
          `\`${
            docSnapshot.ref.path
          }.expenses[${expenseIndex}].issueDate\`'s value \`${expense.issueDate
            .toDate()
            .toString()}\` not matched with project's \`finishDate\`'s value \`${project.finishDate
            .toDate()
            .toString()}\`. Project: \`${project.name}\`.`,
        );
      }
    });

    return Promise.resolve();
  });

  if (!hasProject) {
    info.push(`There is no document in \`${collectionPath}\`.`);
  } else if (errors.length === 0) {
    successes.push(
      `All invoices and expenses of each document in \`${collectionPath}\` have the same info as in their project.`,
    );
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
});
