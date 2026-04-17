import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  api.extendQuasarConf((conf) => {
    conf.boot!.push('shared-components');
  });

  if (api.deployToDev()) {
    api.extendQuasarConf((conf) => {
      conf.boot!.push('shared-components-dev');
    });
  }
});
