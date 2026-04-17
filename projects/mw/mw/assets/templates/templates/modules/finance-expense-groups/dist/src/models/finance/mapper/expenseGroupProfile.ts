import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { ExpenseGroup, ExpenseGroupAm, ExpenseGroupVm } from 'models/finance/index.js';

const expenseGroupBase: MapperMetadata<ExpenseGroup> = {
  isActive: Boolean,
  name: String,
  description: String,
};

PojosMetadataMap.create<ExpenseGroup>('ExpenseGroup', {
  ...expenseGroupBase,

  id: String,
});

PojosMetadataMap.create<ExpenseGroupVm>('ExpenseGroupVm', {
  ...expenseGroupBase,

  id: String,
});

PojosMetadataMap.create<ExpenseGroupAm>('ExpenseGroupAm', {
  ...expenseGroupBase,
});

const fieldTypes: Partial<
  Record<keyof ExpenseGroup & keyof ExpenseGroupVm & keyof ExpenseGroupAm, FieldConfig>
> = {
  description: { dataType: 'string', fieldType: 'optional' },
};

const expenseGroupProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<ExpenseGroup, ExpenseGroupVm, ExpenseGroupAm>(
    mapper,
    'ExpenseGroup',
    'ExpenseGroupVm',
    'ExpenseGroupAm',
    fieldTypes,
  );
};

export default expenseGroupProfile;
