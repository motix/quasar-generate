import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { InvoiceDetail, InvoiceDetailAm, InvoiceDetailVm } from 'models/finance/index.js';

const invoiceDetailBase: MapperMetadata<InvoiceDetail> = {
  content: String,
  quantity: Number,
  unitPrice: Number,
};

PojosMetadataMap.create<InvoiceDetail>('InvoiceDetail', invoiceDetailBase);

PojosMetadataMap.create<InvoiceDetailVm>('InvoiceDetailVm', invoiceDetailBase);

PojosMetadataMap.create<InvoiceDetailAm>('InvoiceDetailAm', invoiceDetailBase);

const fieldTypes: Partial<Record<keyof InvoiceDetail & keyof InvoiceDetailVm, FieldConfig>> = {
  quantity: { dataType: 'number', fieldType: 'required' },
  unitPrice: { dataType: 'number', fieldType: 'required' },
};

const invoiceDetailProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<InvoiceDetail, InvoiceDetailVm, InvoiceDetailAm>(
    mapper,
    'InvoiceDetail',
    'InvoiceDetailVm',
    'InvoiceDetailAm',
    fieldTypes,
  );
};

export default invoiceDetailProfile;
