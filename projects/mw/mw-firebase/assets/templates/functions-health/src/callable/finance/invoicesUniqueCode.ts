import onCallWithPermission from 'utils/onCallWithPermission.js';
import { collectionForeach } from 'utils/queryForeach.js';

import type { InvoiceAm as Invoice, ProjectAm as Project } from 'models/finance/index.js';
import type { HealthCheckResult } from 'models/health/index.js';

// Finance Invoices unique code
export const invoicesUniqueCode = onCallWithPermission(['admin'], async () => {
  const successes: string[] = [];
  const errors: string[] = [];
  const info: string[] = [];

  let itemCount = 0;

  const projectInvoicesCodeMap: Record<string, { projectId: string; quotationIndex: number }> = {};

  await collectionForeach<Project>('finance_projects', (docSnapshot) => {
    docSnapshot.data().quotations.forEach((quotation, quotationIndex) => {
      if (!quotation.invoice) {
        return;
      }

      itemCount++;

      const code = quotation.invoice.code;

      if (projectInvoicesCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}.quotations[${quotationIndex}].invoice\` and \`finance_projects/{${projectInvoicesCodeMap[code].projectId}}.quotations[${projectInvoicesCodeMap[code].quotationIndex}].invoice\` have the same \`code\` '\`${code}\`'`,
        );
      }

      projectInvoicesCodeMap[code] = {
        projectId: docSnapshot.id,
        quotationIndex,
      };
    });

    return Promise.resolve();
  });

  await collectionForeach<Invoice>(
    'finance_generalInvoices',
    (docSnapshot, prevDocSnapshot) => {
      itemCount++;

      const code = docSnapshot.data().code;

      if (projectInvoicesCodeMap[code] !== undefined) {
        errors.push(
          `\`${docSnapshot.ref.path}\` and \`finance_projects/{${projectInvoicesCodeMap[code].projectId}}.quotations[${projectInvoicesCodeMap[code].quotationIndex}].invoice\` have the same \`code\` '\`${code}\`'`,
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
      info.push('There is no Invoice.');
    } else if (itemCount > 1) {
      successes.push(`\`code\`s are unique in all ${itemCount} Invoices.`);
    } else {
      info.push('There is only 1 Invoice.');
    }
  }

  const result: HealthCheckResult = {
    successes,
    errors,
    info,
  };

  return result;
});
