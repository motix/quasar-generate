import getExtensionConfig from '../../lib/extension-config.js';
import { defineInstall } from '../index.js';

export default defineInstall(async function (api) {
  const config = await getExtensionConfig(api.appDir);

  api.renderTemplate('dist', { config });
});
