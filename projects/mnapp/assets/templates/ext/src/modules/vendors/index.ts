import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  const vendorsConfig = api.prompts.vendors as string;
  const vendors = vendorsConfig.split(',');

  // Font Awesome Pro, vue-fontawesome
  if (vendors.includes('fap')) {
    api.extendQuasarConf((conf) => {
      conf.framework!.iconSet = 'fontawesome-v6-pro';
      conf.boot!.unshift('fontawesome-pro');
    });
  }
});
