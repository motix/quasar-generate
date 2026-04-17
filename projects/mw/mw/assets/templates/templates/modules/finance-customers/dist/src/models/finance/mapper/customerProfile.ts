import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Customer, CustomerAm, CustomerVm } from 'models/finance/index.js';

const customerBase: MapperMetadata<Customer> = {
  isActive: Boolean,
  code: String,
  name: String,
};

PojosMetadataMap.create<Customer>('Customer', {
  ...customerBase,

  id: String,
});

PojosMetadataMap.create<CustomerVm>('CustomerVm', {
  ...customerBase,

  id: String,
});

PojosMetadataMap.create<CustomerAm>('CustomerAm', customerBase);

const customerProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Customer, CustomerVm, CustomerAm>(
    mapper,
    'Customer',
    'CustomerVm',
    'CustomerAm',
    {},
  );
};

export default customerProfile;
