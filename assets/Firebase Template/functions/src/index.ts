// Making sure `group.js` only starts loading after `initializeApp` and `setGlobalOptions` were called
import 'utils/initFunctions.js';

import * as group from './group.js';

export const app = group;
