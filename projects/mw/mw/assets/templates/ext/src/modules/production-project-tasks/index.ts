import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  api.extendQuasarConf((conf) => {
    conf.boot!.push('production-project-tasks');
  });
});
