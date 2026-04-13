import { defineBoot } from '#q-app/wrappers';

import { extendProjectsStore as extendExpenseProjectsStore } from 'stores/finance/Projects_ProjectExpenses.js';
import { extendProjectsStore as extendInvoiceProjectsStore } from 'stores/finance/Projects_ProjectInvoices.js';
import { extendProjectsStore as extendTaskProjectsStore } from 'stores/finance/Projects_ProjectTasks.js';
import { extendProjectsStore as extendQuotationProjectsStore } from 'stores/finance/Projects_Quotations.js';

import useConfig from 'composables/useConfig.js';

declare module 'composables/useConfig.js' {
  interface Config {
    portalUrl?: string;
    financeUrl?: string;
  }
}

const host = window.location.hostname;

export default defineBoot(({ router }) => {
  const config = useConfig();

  // URLs

  switch (process.env.FIREBASE_ENV) {
    case 'DEV':
      config.portalUrl = `http://${host}:9001`;
      config.financeUrl = `http://${host}:9004`;
      break;
    case 'STAGE':
      config.portalUrl = 'https://motiwiki-2022.web.app';
      config.financeUrl = 'https://motiwiki-2022-finance.web.app';
      break;
    case 'PROD':
      config.portalUrl = 'https://motiteam.com';
      config.financeUrl = 'https://finance.motiteam.com';
      break;
    default:
      throw new Error(`FIREBASE_ENV '${String(process.env.FIREBASE_ENV)}' not reconized.`);
  }

  // Config

  config.firstYear = 2016;

  // MainLayout

  const mainLayoutRoute = router.getRoutes().find((value) => value.name === 'MainLayout');

  if (mainLayoutRoute) {
    mainLayoutRoute.meta = {
      ...mainLayoutRoute.meta,

      requiresAuth: true,
      roles: ['finance'],
    };
  }

  // Finance

  extendQuotationProjectsStore();
  extendInvoiceProjectsStore();
  extendExpenseProjectsStore();
  extendTaskProjectsStore();
});
