import fs from 'fs';

import { reduceJsonFile } from '../../lib/json-helpers.js';
import { defineInstall } from '../index.js';
import packagesVersion from './packages-version.js';

export default defineInstall(function (api) {
  reduceJsonFile(api, 'package.json', ['scripts.dev', 'scripts.build']);
  api.extendPackageJson({
    scripts: {
      dev: 'cross-env FIREBASE_ENV=DEV quasar dev',
      devp: 'cross-env FIREBASE_ENV=PROD quasar dev',
      'dev:build': 'cross-env FIREBASE_ENV=DEV quasar build',
      'stage:build': 'cross-env FIREBASE_ENV=STAGE quasar build',
      'prod:build': 'cross-env FIREBASE_ENV=PROD quasar build',
      'dev:deploy': 'yarn dev:build && firebase deploy',
      'stage:deploy': 'yarn stage:build && firebase deploy',
      'prod:deploy': 'yarn prod:build && firebase deploy',
      'prod:deploy:debug': 'yarn prod:build --debug && firebase deploy',
      postinstall: 'cross-env FIREBASE_ENV=PROD quasar prepare',
    },
    dependencies: {
      firebase: packagesVersion.firebase,
    },
    devDependencies: {
      'cross-env': packagesVersion['cross-env'],
    },
  });

  api.renderTemplate();

  api.renderFile('../../../templates/modules/firebase/dist-files/firebaserc.txt', '.firebaserc', {
    prompts: api.prompts,
  });
  api.renderFile('../../../templates/modules/firebase/dist-files/firebase.txt', 'firebase.json', {
    prompts: api.prompts,
  });

  modifyFiles();

  api.onExitLog(
    ' \x1b[32mfirebase      • \x1b[0mPlease add \x1b[47m\x1b[30m.env.local-mnapp-firebase\x1b[0m with Firebase config based on \x1b[47m\x1b[30m./firebase-env-template.txt\x1b[0m.',
  );

  function modifyFiles() {
    // Add `.firebase` to `.gitignore`.

    let dotGitignore = fs.readFileSync(api.resolve.app('.gitignore'), 'utf-8');

    if (!dotGitignore.includes('.firebase')) {
      dotGitignore = `${dotGitignore}
# Firebase
.firebase
`;

      fs.writeFileSync(api.resolve.app('.gitignore'), dotGitignore, 'utf-8');
    }
  }
});
