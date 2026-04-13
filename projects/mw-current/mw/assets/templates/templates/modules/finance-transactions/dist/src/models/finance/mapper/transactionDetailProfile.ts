import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type {
  TransactionDetail,
  TransactionDetailAm,
  TransactionDetailVm,
} from 'models/finance/index.js';

const transactionDetailBase: MapperMetadata<TransactionDetail> = {
  content: String,
  quantity: Number,
  unitPrice: Number,
};

PojosMetadataMap.create<TransactionDetail>('TransactionDetail', transactionDetailBase);

PojosMetadataMap.create<TransactionDetailVm>('TransactionDetailVm', transactionDetailBase);

PojosMetadataMap.create<TransactionDetailAm>('TransactionDetailAm', transactionDetailBase);

const fieldTypes: Partial<
  Record<keyof TransactionDetail & keyof TransactionDetailVm, FieldConfig>
> = {
  quantity: { dataType: 'number', fieldType: 'required' },
  unitPrice: { dataType: 'number', fieldType: 'required' },
};

const transactionDetailProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<TransactionDetail, TransactionDetailVm, TransactionDetailAm>(
    mapper,
    'TransactionDetail',
    'TransactionDetailVm',
    'TransactionDetailAm',
    fieldTypes,
  );
};

export default transactionDetailProfile;
