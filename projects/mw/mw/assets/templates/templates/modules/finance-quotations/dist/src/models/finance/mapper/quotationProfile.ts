import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { Quotation, QuotationAm, QuotationVm } from 'models/finance/index.js';

const quotationBase: MapperMetadata<Quotation> = {
  code: String,
  isApproved: Boolean,
  isSentToCustomer: Boolean,
  isConfirmed: Boolean,
  isCancelled: Boolean,
  isRevised: Boolean,
  discount: Number,
  vatPercent: Number,
  vatableAmount: Number,

  listKey: String,
};

PojosMetadataMap.create<Quotation>('Quotation', {
  ...quotationBase,

  createDate: Date,

  details: ['QuotationDetail'],
});

PojosMetadataMap.create<QuotationVm>('QuotationVm', {
  ...quotationBase,

  createDate: String,

  details: ['QuotationDetailVm'],
});

PojosMetadataMap.create<QuotationAm>('QuotationAm', {
  ...quotationBase,

  createDate: Timestamp,

  details: ['QuotationDetailAm'],
});

const fieldTypes: Partial<
  Record<keyof Quotation & keyof QuotationVm & keyof QuotationAm, FieldConfig>
> = {
  createDate: { dataType: 'date', fieldType: 'required' },
  discount: { dataType: 'number', fieldType: 'optional' },
  vatPercent: { dataType: 'number', fieldType: 'optional' },
  vatableAmount: { dataType: 'number', fieldType: 'optional' },
  listKey: { dataType: 'string', fieldType: 'optional' },
};

const quotationProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<Quotation, QuotationVm, QuotationAm>(
    mapper,
    'Quotation',
    'QuotationVm',
    'QuotationAm',
    fieldTypes,
  );
};

export default quotationProfile;
