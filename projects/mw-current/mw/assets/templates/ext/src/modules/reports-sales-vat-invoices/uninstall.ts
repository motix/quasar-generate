import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/SalesVatInvoice', 'src/pages/sales-vat-invoices'],
    removeIfEmpty: ['src/models/reports', 'src/stores/reports'],
  });
});
