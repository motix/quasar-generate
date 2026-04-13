import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

declare module 'composables/useConfig.js' {
  interface Config {
    adminUrl?: string;
    productionUrl?: string;
    financeUrl?: string;
    hrUrl?: string;
    inventoryUrl?: string;
    reportsUrl?: string;
  }
}

const host = window.location.hostname;

export default defineBoot(() => {
  const config = useConfig();

  // Firebase region

  config.firebaseRegion = 'asia-southeast2';

  // URLs

  switch (process.env.FIREBASE_ENV) {
    case 'DEV':
      config.adminUrl = `http://${host}:9002`;
      config.productionUrl = `http://${host}:9003`;
      config.financeUrl = `http://${host}:9004`;
      config.hrUrl = `http://${host}:9005`;
      config.inventoryUrl = `http://${host}:9006`;
      config.reportsUrl = `http://${host}:9007`;
      break;
    case 'STAGE':
      config.adminUrl = 'https://motiwiki-2022-admin.web.app';
      config.productionUrl = 'https://motiwiki-2022-production.web.app';
      config.financeUrl = 'https://motiwiki-2022-finance.web.app';
      config.hrUrl = 'https://motiwiki-2022-hr.web.app';
      config.inventoryUrl = 'https://motiwiki-2022-inventory.web.app';
      config.reportsUrl = 'https://motiwiki-2022-reports.web.app';
      break;
    case 'PROD':
      config.adminUrl = 'https://admin.motiteam.com';
      config.productionUrl = 'https://production.motiteam.com';
      config.financeUrl = 'https://finance.motiteam.com';
      config.hrUrl = 'https://hr.motiteam.com';
      config.inventoryUrl = 'https://inventory.motiteam.com';
      config.reportsUrl = 'https://reports.motiteam.com';
      break;
    default:
      throw new Error(`FIREBASE_ENV '${String(process.env.FIREBASE_ENV)}' not reconized.`);
  }
});
