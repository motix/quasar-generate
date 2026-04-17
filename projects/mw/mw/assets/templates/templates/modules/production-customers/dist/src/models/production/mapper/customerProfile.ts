import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Customer, CustomerAm, CustomerLite } from 'models/production/index.js';

const customerBase: MapperMetadata<Customer> = {
  isActive: Boolean,
  code: String,
  name: String,
};

PojosMetadataMap.create<Customer>('Customer', {
  ...customerBase,

  id: String,
});

PojosMetadataMap.create<CustomerAm>('CustomerAm', customerBase);

PojosMetadataMap.create<CustomerLite>('CustomerLite', {
  id: String,
  code: String,
  name: String,
});

const customerProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Customer, never, CustomerAm>(mapper, 'Customer', null, 'CustomerAm', {});

  configureAndCreateMaps<CustomerLite, never, CustomerAm>(
    mapper,
    'CustomerLite',
    null,
    'CustomerAm',
    {},
  );
};

export default customerProfile;
