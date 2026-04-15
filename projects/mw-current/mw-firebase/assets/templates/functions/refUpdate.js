import fs from 'fs';

import { alias, refFinish, refPrepare, refRoot } from '../functions/refTools.js';

refPrepare();

// `mnapp` `firebase-firestore` from `admin`

fs.cpSync(
  `${refRoot}/motiwiki-2022-admin/src/models/firebase-firestore`,
  './src/ref/models/firebase-firestore',
  {
    recursive: true,
  },
);

// `mnapp` `firebase-auth` for `admin` (with full role set)

fs.cpSync(
  `${refRoot}/motiwiki-2022-admin/src/models/firebase-auth`,
  './src/ref/models/firebase-auth',
  {
    recursive: true,
  },
);

// `mnapp` `slack` from `finance`

fs.mkdirSync('./src/ref/types', { recursive: true });
fs.copyFileSync(
  `${refRoot}/motiwiki-2022-finance/src/types/slack-api.d.ts`,
  './src/ref/types/slack-api.d.ts',
);

// `extensions` `tasks` from `production`

fs.cpSync(`${refRoot}/motiwiki-2022-production/src/models/tasks`, './src/ref/models/tasks', {
  recursive: true,
});
fs.rmSync('./src/ref/models/tasks/mapper', { recursive: true });

// `admin` `membership` models

fs.cpSync(`${refRoot}/motiwiki-2022-admin/src/models/membership`, './src/ref/models/membership', {
  recursive: true,
});
fs.rmSync('./src/ref/models/membership/mapper', { recursive: true });

// `hr` models

fs.cpSync(`${refRoot}/motiwiki-2022-hr/src/models/hr`, './src/ref/models/hr', {
  recursive: true,
});
fs.rmSync('./src/ref/models/hr/mapper', { recursive: true });

// `production` models

fs.cpSync(
  `${refRoot}/motiwiki-2022-production/src/models/production`,
  './src/ref/models/production',
  {
    recursive: true,
  },
);
fs.rmSync('./src/ref/models/production/mapper', { recursive: true });

// `finance` models

fs.cpSync(`${refRoot}/motiwiki-2022-finance/src/models/finance`, './src/ref/models/finance', {
  recursive: true,
});
fs.rmSync('./src/ref/models/finance/mapper', { recursive: true });

refFinish(alias);
