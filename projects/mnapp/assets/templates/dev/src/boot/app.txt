import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

export default defineBoot(() => {
  const config = useConfig();

  config.firstYear = 2022;
  config.firebaseRegion = 'asia-southeast2';
});
