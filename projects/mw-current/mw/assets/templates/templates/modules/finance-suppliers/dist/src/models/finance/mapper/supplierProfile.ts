import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Supplier, SupplierAm, SupplierVm } from 'models/finance/index.js';

const supplierBase: MapperMetadata<Supplier> = {
  isActive: Boolean,
  code: String,
  name: String,
};

PojosMetadataMap.create<Supplier>('Supplier', {
  ...supplierBase,

  id: String,
});

PojosMetadataMap.create<SupplierVm>('SupplierVm', {
  ...supplierBase,

  id: String,
});

PojosMetadataMap.create<SupplierAm>('SupplierAm', supplierBase);

const supplierProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Supplier, SupplierVm, SupplierAm>(
    mapper,
    'Supplier',
    'SupplierVm',
    'SupplierAm',
    {},
  );
};

export default supplierProfile;
