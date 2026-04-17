import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type {
  QuotationDetail,
  QuotationDetailAm,
  QuotationDetailVm,
} from 'models/finance/index.js';

const quotationDetailBase: MapperMetadata<QuotationDetail> = {
  isProductionOnly: Boolean,
  isQuotationOnly: Boolean,
  content: String,
  quantity: Number,
  productionSalaryUnitPrice: Number,
  unitPrice: Number,
};

PojosMetadataMap.create<QuotationDetail>('QuotationDetail', quotationDetailBase);

PojosMetadataMap.create<QuotationDetailVm>('QuotationDetailVm', quotationDetailBase);

PojosMetadataMap.create<QuotationDetailAm>('QuotationDetailAm', quotationDetailBase);

const fieldTypes: Partial<
  Record<keyof QuotationDetail & keyof QuotationDetailVm & keyof QuotationDetailAm, FieldConfig>
> = {
  quantity: { dataType: 'number', fieldType: 'required' },
  productionSalaryUnitPrice: { dataType: 'number', fieldType: 'optional' },
  unitPrice: { dataType: 'number', fieldType: 'optional' },
};

const quotationDetailProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<QuotationDetail, QuotationDetailVm, QuotationDetailAm>(
    mapper,
    'QuotationDetail',
    'QuotationDetailVm',
    'QuotationDetailAm',
    fieldTypes,
  );
};

export default quotationDetailProfile;
