import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { ProductionSalary, ProductionSalaryAm } from 'models/hr/index.js';

const productionSalaryBase: MapperMetadata<ProductionSalary> = {
  amount: Number,

  member: 'MemberLite',
};

PojosMetadataMap.create<ProductionSalary>('ProductionSalary', productionSalaryBase);

PojosMetadataMap.create<ProductionSalaryAm>('ProductionSalaryAm', productionSalaryBase);

const fieldTypes: Partial<Record<keyof ProductionSalary, FieldConfig>> = {
  member: { dataType: 'asIs', fieldType: 'required' },
};

const productionSalaryProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<ProductionSalary, never, ProductionSalaryAm>(
    mapper,
    'ProductionSalary',
    null,
    'ProductionSalaryAm',
    fieldTypes,
  );
};

export default productionSalaryProfile;
