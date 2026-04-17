import type { MappingProfile } from '@automapper/core';
import { afterMap, forMember, mapWith } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';
import InvoiceStatus from 'utils/finance/Invoice/InvoiceStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Invoice, InvoiceAm, InvoiceVm } from 'models/finance/index.js';

const invoiceBase: MapperMetadata<Invoice> = {
  isArchived: Boolean,
  code: String,
  isRequired: Boolean,
  isCompleted: Boolean,
  isApproved: Boolean,
  isRejected: Boolean,
  isSentToCustomer: Boolean,
  isCancelled: Boolean,
  isCapitalContribution: Boolean,
  isExternal: Boolean,
  customerExtraInfo: String,
  referenceNumber: String,
  content: String,
  discount: Number,
  contractSubtotal: Number,
  vatPercent: Number,
  vatableAmount: Number,
  secondVatPercent: Number,
  secondVatableAmount: Number,
  vatAdjustment: Number,
  relocatedSubtotal: Number,
  relocatedVat: Number,
  notes: String,

  customer: 'CustomerLite',

  listKey: String,
};

PojosMetadataMap.create<Invoice>('Invoice', {
  ...invoiceBase,

  id: String,
  createDate: Date,
  issueDate: Date,

  details: ['InvoiceDetail'],
  transactions: ['Transaction'],
});

PojosMetadataMap.create<InvoiceVm>('InvoiceVm', {
  ...invoiceBase,

  id: String,
  createDate: String,
  issueDate: String,

  details: ['InvoiceDetailVm'],
  transactions: ['TransactionVm'],
});

PojosMetadataMap.create<InvoiceAm>('InvoiceAm', {
  ...invoiceBase,

  createDate: Timestamp,
  issueDate: Timestamp,

  details: ['InvoiceDetailAm'],
  transactions: ['TransactionAm'],
});

const fieldTypes: Partial<Record<keyof Invoice & keyof InvoiceVm & keyof InvoiceAm, FieldConfig>> =
  {
    createDate: { dataType: 'date', fieldType: 'required' },
    issueDate: { dataType: 'date', fieldType: 'required' },
    customerExtraInfo: { dataType: 'string', fieldType: 'optional' },
    referenceNumber: { dataType: 'string', fieldType: 'optional' },
    discount: { dataType: 'number', fieldType: 'optional' },
    contractSubtotal: { dataType: 'number', fieldType: 'optional' },
    vatPercent: { dataType: 'number', fieldType: 'optional' },
    vatableAmount: { dataType: 'number', fieldType: 'optional' },
    secondVatPercent: { dataType: 'number', fieldType: 'optional' },
    secondVatableAmount: { dataType: 'number', fieldType: 'optional' },
    vatAdjustment: { dataType: 'number', fieldType: 'optional' },
    relocatedSubtotal: { dataType: 'number', fieldType: 'optional' },
    relocatedVat: { dataType: 'number', fieldType: 'optional' },
    notes: { dataType: 'string', fieldType: 'optional' },
    customer: { dataType: 'asIs', fieldType: 'required' },
    listKey: { dataType: 'string', fieldType: 'optional' },
  };

const invoiceProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Invoice, InvoiceVm, InvoiceAm>(
    mapper,
    'Invoice',
    'InvoiceVm',
    'InvoiceAm',
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
          d.statusHelper = new InvoiceStatus(d, []);

          d.transactions.forEach((transaction) => {
            transaction.statusHelper = new TransactionStatus(transaction, []);
          });
        }),
      ],
      modelToViewModel: [
        afterMap((_, d) => {
          d.statusHelper = new InvoiceStatus(d, []);

          d.transactions.forEach((transaction) => {
            transaction.statusHelper = new TransactionStatus(transaction, []);
          });
        }),
      ],
    },
  );
};

export default invoiceProfile;
