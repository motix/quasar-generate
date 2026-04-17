import { defineBoot } from '#q-app/wrappers';

import { Notify } from 'quasar';

export default defineBoot(() => {
  Notify.setDefaults({
    color: 'grey-6',
  });
});
