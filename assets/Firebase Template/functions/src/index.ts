import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

initializeApp();

setGlobalOptions({
  region: '__REGION__',
});

// Making sure `group.js` only starts loading after `setGlobalOptions` was called
const group = await import('./group.js');

export const app = group;
