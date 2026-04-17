import type { MappingProfile } from '@automapper/core';
import { afterMap, forMember, mapWith } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';
import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Expense, ExpenseAm, ExpenseVm } from 'models/finance/index.js';

const expenseBase: MapperMetadata<Expense> = {
  isArchived: Boolean,
  code: String,
  isCompleted: Boolean,
  isApproved: Boolean,
  isRejected: Boolean,
  isCancelled: Boolean,
  isCapitalWithdrawal: Boolean,
  isExternal: Boolean,
  supplierExtraInfo: String,
  content: String,
  discount: Number,
  vatPercent: Number,
  vatableAmount: Number,
  secondVatPercent: Number,
  secondVatableAmount: Number,
  vatAdjustment: Number,
  notes: String,

  supplier: 'SupplierLite',

  listKey: String,
};

PojosMetadataMap.create<Expense>('Expense', {
  ...expenseBase,

  id: String,
  createDate: Date,
  issueDate: Date,

  details: ['ExpenseDetail'],
  transactions: ['Transaction'],
});

PojosMetadataMap.create<ExpenseVm>('ExpenseVm', {
  ...expenseBase,

  id: String,
  createDate: String,
  issueDate: String,

  details: ['ExpenseDetailVm'],
  transactions: ['TransactionVm'],
});

PojosMetadataMap.create<ExpenseAm>('ExpenseAm', {
  ...expenseBase,

  createDate: Timestamp,
  issueDate: Timestamp,

  details: ['ExpenseDetailAm'],
  transactions: ['TransactionAm'],
});

const fieldTypes: Partial<Record<keyof Expense & keyof ExpenseVm & keyof ExpenseAm, FieldConfig>> =
  {
    createDate: { dataType: 'date', fieldType: 'required' },
    issueDate: { dataType: 'date', fieldType: 'required' },
    supplierExtraInfo: { dataType: 'string', fieldType: 'optional' },
    discount: { dataType: 'number', fieldType: 'optional' },
    vatPercent: { dataType: 'number', fieldType: 'optional' },
    vatableAmount: { dataType: 'number', fieldType: 'optional' },
    secondVatPercent: { dataType: 'number', fieldType: 'optional' },
    secondVatableAmount: { dataType: 'number', fieldType: 'optional' },
    vatAdjustment: { dataType: 'number', fieldType: 'optional' },
    notes: { dataType: 'string', fieldType: 'optional' },
    supplier: { dataType: 'asIs', fieldType: 'required' },
    listKey: { dataType: 'string', fieldType: 'optional' },
  };

const expenseProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Expense, ExpenseVm, ExpenseAm>(
    mapper,
    'Expense',
    'ExpenseVm',
    'ExpenseAm',
    fieldTypes,
    {
      apiModelToModel: [
        forMember(
          (d) => d.transactions,
          mapWith('Transaction', 'TransactionAm', (s) =>
            s.transactions.map((value) => ({
              id: '_',
              ...value,
            })),
          ),
        ),
        afterMap((_, d) => {
          d.statusHelper = new ExpenseStatus(d, []);

          d.transactions.forEach((transaction) => {
            transaction.statusHelper = new TransactionStatus(transaction, []);
          });
        }),
      ],
      modelToViewModel: [
        afterMap((_, d) => {
          d.statusHelper = new ExpenseStatus(d, []);

          d.transactions.forEach((transaction) => {
            transaction.statusHelper = new TransactionStatus(transaction, []);
          });
        }),
      ],
    },
  );
};

export default expenseProfile;
