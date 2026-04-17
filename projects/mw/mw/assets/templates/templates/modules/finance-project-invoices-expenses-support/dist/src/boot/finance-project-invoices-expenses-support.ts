import { defineBoot } from '#q-app/wrappers';

import { projectViewPageExtensions } from 'composables/finance/project/useProjectViewPage.js';
import { extendProjectViewPage_ProjectInvoicesExpensesSupport } from 'composables/finance/project/useProjectViewPage_ProjectInvoicesExpensesSupport.js';

export default defineBoot(() => {
  // useProjectViewPage

  projectViewPageExtensions.push(extendProjectViewPage_ProjectInvoicesExpensesSupport);
});
