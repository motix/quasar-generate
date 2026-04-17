import { defineBoot } from '#q-app/wrappers';

import extensionRegistered from 'utils/finance/extensionRegistered.js';

import { extendProjectsStore } from 'stores/finance/Projects_ProjectInvoices.js';

import { invoiceViewPageExtensions } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { extendInvoiceViewPage_ProjectInvoices } from 'composables/finance/invoice/useInvoiceEditPage_ProjectInvoices.js';
import { projectViewPageExtensions } from 'composables/finance/project/useProjectViewPage.js';
import { extendProjectViewPage_ProjectInvoices } from 'composables/finance/project/useProjectViewPage_ProjectInvoices.js';
import { extendProjectViewPage_ProjectInvoicesExpensesSupport } from 'composables/finance/project/useProjectViewPage_ProjectInvoicesExpensesSupport.js';
import { extendProjectViewPage_Quotations } from 'composables/finance/project/useProjectViewPage_Quotations.js';
import { quotationViewPageExtensions } from 'composables/finance/quotation/useQuotationViewPage.js';
import { extendQuotationViewPage_ProjectInvoices } from 'composables/finance/quotation/useQuotationViewPage_ProjectInvoices.js';

export default defineBoot(({ router }) => {
  // Projects store

  extendProjectsStore();

  // useProjectViewPage

  extensionRegistered(
    projectViewPageExtensions,
    extendProjectViewPage_Quotations,
    'extendProjectViewPage_Quotations must be registered before extendProjectViewPage_ProjectInvoices',
  ) &&
    extensionRegistered(
      projectViewPageExtensions,
      extendProjectViewPage_ProjectInvoicesExpensesSupport,
      'extendProjectViewPage_ProjectInvoicesExpensesSupport must be registered before extendProjectViewPage_ProjectInvoices',
    ) &&
    projectViewPageExtensions.push(extendProjectViewPage_ProjectInvoices);

  // useQuotationViewPage

  quotationViewPageExtensions.push(extendQuotationViewPage_ProjectInvoices);

  // useInvoiceEditPage

  invoiceViewPageExtensions.push(
    // modelBeforeUpdateActions and modelBeforeUpdate made casting required
    extendInvoiceViewPage_ProjectInvoices as (typeof invoiceViewPageExtensions)[number],
  );

  // Project Invoices

  router.addRoute('MainLayout', {
    path: 'project-invoices',
    meta: { mainTransitionKey: 'project-invoices' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Project Invoices' },
        component: () => import('pages/project-invoices/IndexPage.vue'),
      },
      {
        path: ':parentFindKey/:findKey?',
        meta: { pageTitle: 'Project Invoice', returnRequired: true },
        component: () => import('pages/project-invoices/ViewProjectInvoice.vue'),
      },
    ],
  });
});
