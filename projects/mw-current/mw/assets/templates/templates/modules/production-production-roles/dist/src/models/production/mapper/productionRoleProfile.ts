import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type {
  ProductionRole,
  ProductionRoleAm,
  ProductionRoleLite,
  ProductionRoleSortableLite,
  ProductionRoleVm,
} from 'models/production/index.js';

const productionRoleBase: MapperMetadata<ProductionRole> = {
  isActive: Boolean,
  name: String,
  position: Number,
};

PojosMetadataMap.create<ProductionRole>('ProductionRole', {
  ...productionRoleBase,

  id: String,
});

PojosMetadataMap.create<ProductionRoleVm>('ProductionRoleVm', {
  ...productionRoleBase,

  id: String,
});

PojosMetadataMap.create<ProductionRoleAm>('ProductionRoleAm', productionRoleBase);

PojosMetadataMap.create<ProductionRoleLite>('ProductionRoleLite', {
  id: String,
  name: String,
});

PojosMetadataMap.create<ProductionRoleSortableLite>('ProductionRoleSortableLite', {
  id: String,
  name: String,
  position: Number,
});

const fieldTypes: Partial<Record<keyof ProductionRole, FieldConfig>> = {
  position: { dataType: 'number', fieldType: 'required' },
};

const productionRoleProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<ProductionRole, ProductionRoleVm, ProductionRoleAm>(
    mapper,
    'ProductionRole',
    'ProductionRoleVm',
    'ProductionRoleAm',
    fieldTypes,
  );

  configureAndCreateMaps<ProductionRoleLite, never, ProductionRoleAm>(
    mapper,
    'ProductionRoleLite',
    null,
    'ProductionRoleAm',
    {},
  );

  configureAndCreateMaps<ProductionRoleSortableLite, never, ProductionRoleAm>(
    mapper,
    'ProductionRoleSortableLite',
    null,
    'ProductionRoleAm',
    {},
  );
};

export default productionRoleProfile;
