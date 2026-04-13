import { defineBoot } from '#q-app/wrappers';

import extensionRegistered from 'utils/finance/extensionRegistered.js';

import { invoiceViewPageExtensions } from 'composables/finance/invoice/useInvoiceEditPage.js';
import { extendInvoiceViewPage_InvoiceGroups } from 'composables/finance/invoice/useInvoiceEditPage_InvoiceGroups.js';
import { extendInvoiceViewPage_ProjectInvoiceGroups } from 'composables/finance/invoice/useInvoiceEditPage_ProjectInvoiceGroups.js';
import {
  extendInvoiceViewPage_ProjectInvoices,
  projectInvoiceEditPageComponentStore,
} from 'composables/finance/invoice/useInvoiceEditPage_ProjectInvoices.js';

import InvoiceEditorMain_ProjectInvoiceGroups from 'components/Invoice/InvoiceEditorMain_ProjectInvoiceGroups.vue';
import InvoiceViewer_ProjectInvoiceGroups from 'components/Invoice/InvoiceViewer_ProjectInvoiceGroups.vue';

export default defineBoot(() => {
  // useInvoiceEditPage

  extensionRegistered(
    invoiceViewPageExtensions,
    extendInvoiceViewPage_InvoiceGroups,
    'extendInvoiceViewPage_InvoiceGroups must be registered before extendInvoiceViewPage_ProjectInvoiceGroups',
  ) &&
    extensionRegistered(
      invoiceViewPageExtensions,
      extendInvoiceViewPage_ProjectInvoices,
      'extendInvoiceViewPage_ProjectInvoices must be registered before extendInvoiceViewPage_ProjectInvoiceGroups',
    ) &&
    invoiceViewPageExtensions.push(extendInvoiceViewPage_ProjectInvoiceGroups);

  projectInvoiceEditPageComponentStore.projectInvoiceViewer = InvoiceViewer_ProjectInvoiceGroups;
  projectInvoiceEditPageComponentStore.projectInvoiceEditorMain =
    InvoiceEditorMain_ProjectInvoiceGroups;
});
