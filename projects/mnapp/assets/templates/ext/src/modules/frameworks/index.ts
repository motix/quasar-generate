import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  api.extendQuasarConf((conf) => {
    conf.framework!.plugins!.push('Meta', 'Notify', 'Dialog');

    const originalExtendTsConfig = conf.build!.typescript!.extendTsConfig;

    conf.build!.typescript!.extendTsConfig = (tsConfig) => {
      originalExtendTsConfig?.(tsConfig);
      tsConfig.exclude?.push('./../.bk');
    };

    conf.build!.typescript!.vueShim = false;
  });
});
