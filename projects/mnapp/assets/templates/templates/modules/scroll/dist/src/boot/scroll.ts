import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

export default defineBoot(() => {
  const config = useConfig();

  if (config.scrollDuration === undefined) config.scrollDuration = 500;
  if (config.scrollOffset === undefined) config.scrollOffset = 50;
});
