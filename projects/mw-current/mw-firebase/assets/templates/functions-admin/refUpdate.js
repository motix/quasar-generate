import fs from 'fs';

import { alias, refFinish, refPrepare, refRoot } from '../functions/refTools.js';

refPrepare();

// `mnapp` `slack` from `finance`

fs.mkdirSync('./src/ref/types', { recursive: true });
fs.copyFileSync(
  `${refRoot}/motiwiki-2022-finance/src/types/slack-api.d.ts`,
  './src/ref/types/slack-api.d.ts',
);

refFinish(alias);
