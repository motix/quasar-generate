import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { BalanceRecord, BalanceRecordAm, BalanceRecordVm } from 'models/finance/index.js';

const balanceRecordBase: MapperMetadata<BalanceRecord> = {
  balance: Number,
};

PojosMetadataMap.create<BalanceRecord>('BalanceRecord', {
  ...balanceRecordBase,

  date: Date,
});

PojosMetadataMap.create<BalanceRecordVm>('BalanceRecordVm', {
  ...balanceRecordBase,

  date: String,
});

PojosMetadataMap.create<BalanceRecordAm>('BalanceRecordAm', {
  ...balanceRecordBase,

  date: Timestamp,
});

const fieldTypes: Partial<
  Record<keyof BalanceRecord & keyof BalanceRecordVm & keyof BalanceRecordAm, FieldConfig>
> = {
  date: { dataType: 'date', fieldType: 'required' },
  balance: { dataType: 'number', fieldType: 'required' },
};

const balanceRecordProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<BalanceRecord, BalanceRecordVm, BalanceRecordAm>(
    mapper,
    'BalanceRecord',
    'BalanceRecordVm',
    'BalanceRecordAm',
    fieldTypes,
  );
};

export default balanceRecordProfile;
