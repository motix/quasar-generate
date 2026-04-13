import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  api.extendQuasarConf((conf) => {
    const vitePlugins = conf.build!.vitePlugins || [];

    vitePlugins.push(['vite-plugin-markdown', { mode: ['vue'] }]);
    conf.build!.vitePlugins = vitePlugins;
  });
});
