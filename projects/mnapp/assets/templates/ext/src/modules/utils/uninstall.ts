import { reduceJsonFile } from '../../lib/json-helpers.js';
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree();

  if (!api.hasModule('firebase')) {
    reduceJsonFile(api, 'package.json', ['dependencies.firebase']);
  }
});
