import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  api.extendQuasarConf((conf) => {
    conf.boot!.push('crud-pages');
  });

  if (api.deployToDev()) {
    api.extendQuasarConf((conf) => {
      conf.boot!.push('crud-pages-dev');
    });
  }
});
