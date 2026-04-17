import { defineBoot } from '#q-app/wrappers';

import { invoiceViewPageExtensions } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { extendInvoiceViewPage_SalesContracts } from 'composables/finance/invoice/useInvoiceEditPage_SalesContracts.js';
import { projectViewPageExtensions } from 'composables/finance/project/useProjectViewPage.js';
import { extendProjectViewPage_SalesContracts } from 'composables/finance/project/useProjectViewPage_SalesContracts.js';

export default defineBoot(({ router }) => {
  // useInvoiceEditPage

  invoiceViewPageExtensions.push(
    // modelBeforeUpdateActions and modelBeforeUpdate made casting required
    extendInvoiceViewPage_SalesContracts as (typeof invoiceViewPageExtensions)[number],
  );

  // useProjectViewPage

  projectViewPageExtensions.push(extendProjectViewPage_SalesContracts);

  // Sales Contracts

  router.addRoute('MainLayout', {
    path: 'sales-contracts',
    meta: { mainTransitionKey: 'sales-contracts' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Sales Contracts' },
        component: () => import('pages/sales-contracts/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Sales Contract',
          isNoReturnPage: true,
        },
        component: () => import('pages/sales-contracts/NewSalesContract.vue'),
      },
      {
        path: ':findKey',
        meta: {
          pageTitle: 'Sales Contract',
          returnRequired: true,
          subTransitionKeyName: 'findKey',
        },
        component: () => import('pages/sales-contracts/ViewSalesContract.vue'),
      },
    ],
  });
});
