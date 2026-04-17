import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig } from 'utils/automapper.js';
import { configureAndExtendMaps } from 'utils/automapper.js';

import type { Expense, ExpenseAm, ExpenseVm } from 'models/finance/index.js';

PojosMetadataMap.create<Expense>('Expense', {
  group: 'ExpenseGroupLite',
});

PojosMetadataMap.create<ExpenseVm>('ExpenseVm', {
  group: 'ExpenseGroupLite',
});

PojosMetadataMap.create<ExpenseAm>('ExpenseAm', {
  group: 'ExpenseGroupLite',
});

const fieldTypes: Partial<Record<keyof Expense & keyof ExpenseVm & keyof ExpenseAm, FieldConfig>> =
  {
    group: { dataType: 'asIs', fieldType: 'optional' },
  };

const expenseProfile: MappingProfile = (mapper) => {
  configureAndExtendMaps<Expense, ExpenseVm, ExpenseAm>(
    mapper,
    'Expense',
    'ExpenseVm',
    'ExpenseAm',
    fieldTypes,
  );
};

export default expenseProfile;
