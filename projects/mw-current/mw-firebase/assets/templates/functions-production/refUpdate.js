import fs from 'fs';

import { alias, refFinish, refPrepare, refRoot } from '../functions/refTools.js';

refPrepare();

// `mnapp` `utils` from `production`

fs.mkdirSync('./src/ref/utils', { recursive: true });
fs.copyFileSync(
  `${refRoot}/motiwiki-2022-production/src/utils/calculation.ts`,
  './src/ref/utils/calculation.ts',
);

// `mnapp` `slack` from `finance`

fs.mkdirSync('./src/ref/types', { recursive: true });
fs.copyFileSync(
  `${refRoot}/motiwiki-2022-finance/src/types/slack-api.d.ts`,
  './src/ref/types/slack-api.d.ts',
);

// `production` composables

fs.mkdirSync('./src/ref/composables/production/project', { recursive: true });
fs.copyFileSync(
  `${refRoot}/motiwiki-2022-production/src/composables/production/project/useProjectCalculator.ts`,
  './src/ref/composables/production/project/useProjectCalculator.ts',
);

refFinish({
  ...alias,

  // composables
  'composables/*': ['./src/ref/composables/*'],
});
