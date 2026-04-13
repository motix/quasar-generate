import type { MappingProfile } from '@automapper/core';
import { afterMap } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Transaction, TransactionAm, TransactionVm } from 'models/finance/index.js';

const transactionBase: MapperMetadata<Transaction> = {
  isArchived: Boolean,
  code: String,
  type: String,
  isCleared: Boolean,
  isCancelled: Boolean,
  content: String,
  notes: String,

  sourceFinanceAccount: 'FinanceAccountLite',
  destinationFinanceAccount: 'FinanceAccountLite',

  listKey: String,
};

PojosMetadataMap.create<Transaction>('Transaction', {
  ...transactionBase,

  id: String,
  createDate: Date,
  issueDate: Date,

  details: ['TransactionDetail'],
});

PojosMetadataMap.create<TransactionVm>('TransactionVm', {
  ...transactionBase,

  id: String,
  createDate: String,
  issueDate: String,

  details: ['TransactionDetailVm'],
});

PojosMetadataMap.create<TransactionAm>('TransactionAm', {
  ...transactionBase,

  createDate: Timestamp,
  issueDate: Timestamp,

  details: ['TransactionDetailAm'],
});

const fieldTypes: Partial<
  Record<keyof Transaction & keyof TransactionVm & keyof TransactionAm, FieldConfig>
> = {
  createDate: { dataType: 'date', fieldType: 'required' },
  issueDate: { dataType: 'date', fieldType: 'required' },
  notes: { dataType: 'string', fieldType: 'optional' },
  sourceFinanceAccount: { dataType: 'asIs', fieldType: 'optional' },
  destinationFinanceAccount: { dataType: 'asIs', fieldType: 'optional' },
  listKey: { dataType: 'string', fieldType: 'optional' },
};

const transactionProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Transaction, TransactionVm, TransactionAm>(
    mapper,
    'Transaction',
    'TransactionVm',
    'TransactionAm',
    fieldTypes,
    {
      apiModelToModel: [
        afterMap((_, d) => {
          d.statusHelper = new TransactionStatus(d, []);
        }),
      ],
      modelToViewModel: [
        afterMap((_, d) => {
          d.statusHelper = new TransactionStatus(d, []);
        }),
      ],
    },
  );
};

export default transactionProfile;
