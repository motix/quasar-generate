import { defineBoot } from '#q-app/wrappers';

import useConfig from 'composables/useConfig.js';

export default defineBoot(() => {
  const config = useConfig();

  if (config.dateFormat === undefined) config.dateFormat = 'DD/MM/YYYY';
  if (config.timeFormat === undefined) config.timeFormat = 'hh:mm A';
  if (config.editDateFormat === undefined) config.editDateFormat = 'DDMMYYYY';
  if (config.dateMask === undefined) config.dateMask = '##/##/####';
  if (config.monthDayFormat === undefined) config.monthDayFormat = 'DD/MM';
});
