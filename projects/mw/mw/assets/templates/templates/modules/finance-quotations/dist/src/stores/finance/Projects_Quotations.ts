import QuotationStatus from 'utils/finance/Quotation/QuotationStatus.js';

import { storeOptions } from 'stores/finance/Projects.js';

let projectsStoreExtended = false;

export function extendProjectsStore() {
  if (projectsStoreExtended) {
    return;
  }

  const currentApiModelToModelAfterMap = storeOptions.mapperOptions?.apiModelToModelAfterMap;

  storeOptions.mapperOptions = {
    ...(storeOptions.mapperOptions || {}),

    apiModelToModelAfterMap: (source, destination) => {
      currentApiModelToModelAfterMap && currentApiModelToModelAfterMap(source, destination);

      destination.forEach((project) => {
        project.quotations.forEach((quotation) => {
          quotation.statusHelper = new QuotationStatus(quotation, []);
        });
      });
    },
  };

  projectsStoreExtended = true;
}
