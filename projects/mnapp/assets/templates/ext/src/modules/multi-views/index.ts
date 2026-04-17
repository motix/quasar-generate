import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  if (api.deployToDev()) {
    api.extendQuasarConf((conf) => {
      conf.boot!.push('multi-views-dev');
    });
  }
});
