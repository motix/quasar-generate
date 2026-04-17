import type { MappingProfile } from '@automapper/core';
import { afterMap } from '@automapper/core';

import { extendMapping } from 'utils/automapper.js';
import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';
import ProjectStatus_ProjectInvoices from 'utils/finance/Project/ProjectStatus_ProjectInvoices.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';

const projectProfile: MappingProfile = (mapper) => {
  extendMapping<ProjectAm, Project>(
    mapper,
    'ProjectAm',
    'Project',
    afterMap((_, d) => {
      d.statusHelper = new ProjectStatus_ProjectInvoices(d, []);

      d.quotations.forEach((quotation) => {
        if (quotation.invoice) {
          quotation.invoice.statusHelper = new InvoiceStatus(quotation.invoice, []);

          quotation.invoice.transactions.forEach((transaction) => {
            transaction.statusHelper = new TransactionStatus(transaction, []);
          });
        }
      });
    }),
  );

  extendMapping<Project, ProjectVm>(
    mapper,
    'Project',
    'ProjectVm',
    afterMap((_, d) => {
      d.statusHelper = new ProjectStatus_ProjectInvoices(d, []);

      d.quotations.forEach((quotation) => {
        if (quotation.invoice) {
          quotation.invoice.statusHelper = new InvoiceStatus(quotation.invoice, []);

          quotation.invoice.transactions.forEach((transaction) => {
            transaction.statusHelper = new TransactionStatus(transaction, []);
          });
        }
      });
    }),
  );
};

export default projectProfile;
