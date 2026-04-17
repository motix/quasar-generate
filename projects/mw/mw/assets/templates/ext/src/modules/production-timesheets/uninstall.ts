// removeTree(api, './templates/dist', ['src/components/Timesheet', 'src/pages/timesheets']);
import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: ['src/components/Timesheet', 'src/pages/timesheets'],
    removeIfEmpty: ['src/stores/production'],
  });
});
