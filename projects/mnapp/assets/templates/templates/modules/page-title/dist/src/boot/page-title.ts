import packageJson from 'app/package.json';

import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

export default defineBoot(() => {
  const config = useConfig();

  if (config.appName === undefined) config.appName = packageJson.productName;
});
