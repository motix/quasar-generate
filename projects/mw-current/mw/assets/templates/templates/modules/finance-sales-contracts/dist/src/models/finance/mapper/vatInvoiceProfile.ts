import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { VatInvoice, VatInvoiceAm, VatInvoiceVm } from 'models/finance/index.js';

const vatInvoiceBase: MapperMetadata<VatInvoice> = {
  code: String,
  isCancelled: Boolean,
  content: String,
  subTotal: Number,
  vatPercent: Number,
  vatAdjustment: Number,
};

PojosMetadataMap.create<VatInvoice>('VatInvoice', {
  ...vatInvoiceBase,

  issueDate: Date,
});

PojosMetadataMap.create<VatInvoiceVm>('VatInvoiceVm', {
  ...vatInvoiceBase,

  issueDate: String,
});

PojosMetadataMap.create<VatInvoiceAm>('VatInvoiceAm', {
  ...vatInvoiceBase,

  issueDate: Timestamp,
});

const fieldTypes: Partial<
  Record<keyof VatInvoice & keyof VatInvoiceVm & keyof VatInvoiceAm, FieldConfig>
> = {
  issueDate: { dataType: 'date', fieldType: 'required' },
  subTotal: { dataType: 'number', fieldType: 'required' },
  vatPercent: { dataType: 'number', fieldType: 'optional' },
  vatAdjustment: { dataType: 'number', fieldType: 'optional' },
};

const vatInvoiceProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<VatInvoice, VatInvoiceVm, VatInvoiceAm>(
    mapper,
    'VatInvoice',
    'VatInvoiceVm',
    'VatInvoiceAm',
    fieldTypes,
  );
};

export default vatInvoiceProfile;
