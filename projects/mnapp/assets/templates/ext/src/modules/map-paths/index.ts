import { defineIndex } from '../index.js';

export default defineIndex(function (api) {
  api.extendQuasarConf((conf) => {
    Object.assign(conf.build!, {
      alias: {
        utils: '../src/utils',
        'utils/*': '../src/utils/*',
        models: '../src/models',
        'models/*': '../src/models/*',
        api: '../src/api',
        'api/*': '../src/api/*',
        services: '../src/services',
        'services/*': '../src/services/*',
        composables: '../src/composables',
        'composables/*': '../src/composables/*',
      },
    });
  });

  api.extendViteConf((conf) => {
    Object.assign(conf.resolve!.alias!, {
      utils: api.resolve.src('utils'),
      models: api.resolve.src('models'),
      api: api.resolve.src('api'),
      services: api.resolve.src('services'),
      composables: api.resolve.src('composables'),
    });
  });
});
