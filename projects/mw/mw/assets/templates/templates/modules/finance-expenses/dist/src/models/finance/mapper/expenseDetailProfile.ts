import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { ExpenseDetail, ExpenseDetailAm, ExpenseDetailVm } from 'models/finance/index.js';

const expenseDetailBase: MapperMetadata<ExpenseDetail> = {
  content: String,
  quantity: Number,
  unitPrice: Number,
};

PojosMetadataMap.create<ExpenseDetail>('ExpenseDetail', expenseDetailBase);

PojosMetadataMap.create<ExpenseDetailVm>('ExpenseDetailVm', expenseDetailBase);

PojosMetadataMap.create<ExpenseDetailAm>('ExpenseDetailAm', expenseDetailBase);

const fieldTypes: Partial<Record<keyof ExpenseDetail & keyof ExpenseDetailVm, FieldConfig>> = {
  quantity: { dataType: 'number', fieldType: 'required' },
  unitPrice: { dataType: 'number', fieldType: 'required' },
};

const expenseDetailProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<ExpenseDetail, ExpenseDetailVm, ExpenseDetailAm>(
    mapper,
    'ExpenseDetail',
    'ExpenseDetailVm',
    'ExpenseDetailAm',
    fieldTypes,
  );
};

export default expenseDetailProfile;
