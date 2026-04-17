import { defineBoot } from '#q-app/wrappers';

import { projectViewPageExtensions } from 'composables/finance/project/useProjectViewPage.js';
import { extendProjectViewPage_ProjectMessages } from 'composables/finance/project/useProjectViewPage_ProjectMessages.js';

export default defineBoot(() => {
  // useProjectViewPage

  projectViewPageExtensions.push(extendProjectViewPage_ProjectMessages);
});
