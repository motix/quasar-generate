import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

initializeApp();

setGlobalOptions({
  region: 'asia-southeast2',
});

// Making sure groups only start loading after `setGlobalOptions` was called
const admin = await import('./healthAdmin.js');
const hr = await import('./healthHr.js');
const production = await import('./healthProduction.js');
const finance = await import('./healthFinance.js');

export const healthAdmin = admin;
export const healthHr = hr;
export const healthProduction = production;
export const healthFinance = finance;
