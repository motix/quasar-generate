import { defineInstall } from '../index.js';
import packagesVersion from './packages-version.js';

export default defineInstall(function (api) {
  const packages: (keyof typeof packagesVersion)[] = ['slack', 'slack-message-parser'];
  api.extendPackageJson({
    dependencies: Object.fromEntries(packages.map((item) => [item, packagesVersion[item]])),
  });

  api.renderTemplate();

  api.onExitLog(
    ' \x1b[32mslack         • \x1b[0mPlease add \x1b[47m\x1b[30m.env.local-mnapp-slack\x1b[0m with Slack config based on \x1b[47m\x1b[30m./slack-env-template.txt\x1b[0m.',
  );
});
