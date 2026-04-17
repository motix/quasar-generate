import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { FinanceAccount, FinanceAccountAm, FinanceAccountVm } from 'models/finance/index.js';

const financeAccountBase: MapperMetadata<FinanceAccount> = {
  isActive: Boolean,
  name: String,
  description: String,
};

PojosMetadataMap.create<FinanceAccount>('FinanceAccount', {
  ...financeAccountBase,

  id: String,

  balanceRecords: ['BalanceRecord'],
});

PojosMetadataMap.create<FinanceAccountVm>('FinanceAccountVm', {
  ...financeAccountBase,

  id: String,

  balanceRecords: ['BalanceRecordVm'],
});

PojosMetadataMap.create<FinanceAccountAm>('FinanceAccountAm', {
  ...financeAccountBase,

  balanceRecords: ['BalanceRecordAm'],
});

const fieldTypes: Partial<
  Record<keyof FinanceAccount & keyof FinanceAccountVm & keyof FinanceAccountAm, FieldConfig>
> = {
  description: { dataType: 'string', fieldType: 'optional' },
};

const financeAccountProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<FinanceAccount, FinanceAccountVm, FinanceAccountAm>(
    mapper,
    'FinanceAccount',
    'FinanceAccountVm',
    'FinanceAccountAm',
    fieldTypes,
  );
};

export default financeAccountProfile;
