import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type {
  ProductionSalaryDetail,
  ProductionSalaryDetailAm,
  ProductionSalaryDetailVm,
} from 'models/production/index.js';

const productionSalaryDetailBase: MapperMetadata<ProductionSalaryDetail> = {
  productionSalary: Number,

  productionRole: 'ProductionRoleSortableLite',
};

PojosMetadataMap.create<ProductionSalaryDetail>(
  'ProductionSalaryDetail',
  productionSalaryDetailBase,
);

PojosMetadataMap.create<ProductionSalaryDetailVm>(
  'ProductionSalaryDetailVm',
  productionSalaryDetailBase,
);

PojosMetadataMap.create<ProductionSalaryDetailAm>(
  'ProductionSalaryDetailAm',
  productionSalaryDetailBase,
);

const fieldTypes: Partial<Record<keyof ProductionSalaryDetail, FieldConfig>> = {
  productionSalary: { dataType: 'number', fieldType: 'required' },
  productionRole: { dataType: 'asIs', fieldType: 'required' },
};

const productionSalaryDetailProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<
    ProductionSalaryDetail,
    ProductionSalaryDetailVm,
    ProductionSalaryDetailAm
  >(
    mapper,
    'ProductionSalaryDetail',
    'ProductionSalaryDetailVm',
    'ProductionSalaryDetailAm',
    fieldTypes,
  );
};

export default productionSalaryDetailProfile;
