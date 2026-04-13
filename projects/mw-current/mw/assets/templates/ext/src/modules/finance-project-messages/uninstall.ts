import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    removeIfEmpty: ['src/models/finance/mapper', 'src/models/finance'],
  });
});
