import { defineBoot } from '#q-app/wrappers';

import {
  invoiceEditPageComponentStore,
  invoiceNewPageExtensions,
  invoiceViewPageExtensions,
} from 'composables/finance/invoice/useInvoiceEditPage.js';
import {
  extendInvoiceNewPage_InvoiceGroups,
  extendInvoiceViewPage_InvoiceGroups,
} from 'composables/finance/invoice/useInvoiceEditPage_InvoiceGroups.js';

import InvoiceEditorMain_InvoiceGroups from 'components/Invoice/InvoiceEditorMain_InvoiceGroups.vue';
import InvoiceViewer_InvoiceGroups from 'components/Invoice/InvoiceViewer_InvoiceGroups.vue';

export default defineBoot(({ router }) => {
  // useInvoiceEditPage

  invoiceNewPageExtensions.push(
    // viewModelBeforeCreateActions and viewModelBeforeCreate made casting required
    extendInvoiceNewPage_InvoiceGroups as (typeof invoiceNewPageExtensions)[number],
  );
  invoiceViewPageExtensions.push(
    // modelBeforeUpdateActions and modelBeforeUpdate made casting required
    extendInvoiceViewPage_InvoiceGroups as (typeof invoiceViewPageExtensions)[number],
  );
  invoiceEditPageComponentStore.invoiceViewer = InvoiceViewer_InvoiceGroups;
  invoiceEditPageComponentStore.invoiceEditorMain = InvoiceEditorMain_InvoiceGroups;

  // Invoice Groups

  router.addRoute('MainLayout', {
    path: 'invoice-groups',
    meta: { mainTransitionKey: 'invoice-groups' },
    component: () => import('layouts/AliveSubLayout.vue'),
    children: [
      {
        path: '',
        meta: { pageTitle: 'Invoice Groups' },
        component: () => import('pages/invoice-groups/IndexPage.vue'),
      },
      {
        path: 'new',
        meta: {
          pageTitle: 'New Invoice Group',
          isNoReturnPage: true,
        },
        component: () => import('pages/invoice-groups/NewInvoiceGroup.vue'),
      },
      {
        path: ':findKey',
        meta: { pageTitle: 'Invoice Group', returnRequired: true },
        component: () => import('pages/invoice-groups/ViewInvoiceGroup.vue'),
      },
    ],
  });
});
