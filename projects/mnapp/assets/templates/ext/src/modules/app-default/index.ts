import fs from 'fs';

import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  api.extendQuasarConf((conf, api) => {
    conf.devServer!.port = api.prompts.devServerPort as number;

    if (api.prompts.https) {
      conf.devServer!.https = {
        key: fs.readFileSync(api.resolve.app('mkcerts/server.key')),
        cert: fs.readFileSync(api.resolve.app('mkcerts/server.crt')),
      };
    }

    if (api.prompts.dark) {
      conf.framework!.config!.dark = 'auto';
    }

    conf.build!.vueRouterMode = 'history';
    conf.boot!.push('notify');
    conf.css!.push('app-default.scss');
  });
});
