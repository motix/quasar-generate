import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type {
  ProductType,
  ProductTypeAm,
  ProductTypeLite,
  ProductTypeVm,
} from 'models/production/index.js';

const productTypeBase: MapperMetadata<ProductType<never>> = {
  isActive: Boolean,
  name: String,
  position: Number,
};

PojosMetadataMap.create<ProductType<never>>('ProductType', {
  ...productTypeBase,

  id: String,
});

PojosMetadataMap.create<ProductTypeVm>('ProductTypeVm', {
  ...productTypeBase,

  id: String,
});

PojosMetadataMap.create<ProductTypeAm>('ProductTypeAm', productTypeBase);

PojosMetadataMap.create<ProductTypeLite>('ProductTypeLite', {
  id: String,
  name: String,
});

const fieldTypes: Partial<Record<keyof ProductType<never>, FieldConfig>> = {
  position: { dataType: 'number', fieldType: 'required' },
};

const productTypeProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<ProductType<never>, ProductTypeVm, ProductTypeAm>(
    mapper,
    'ProductType',
    'ProductTypeVm',
    'ProductTypeAm',
    fieldTypes,
  );

  configureAndCreateMaps<ProductTypeLite, never, ProductTypeAm>(
    mapper,
    'ProductTypeLite',
    null,
    'ProductTypeAm',
    {},
  );
};

export default productTypeProfile;
