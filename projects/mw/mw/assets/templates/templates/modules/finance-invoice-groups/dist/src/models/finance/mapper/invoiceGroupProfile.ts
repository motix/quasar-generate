import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { InvoiceGroup, InvoiceGroupAm, InvoiceGroupVm } from 'models/finance/index.js';

const invoiceGroupBase: MapperMetadata<InvoiceGroup> = {
  isActive: Boolean,
  name: String,
  description: String,
};

PojosMetadataMap.create<InvoiceGroup>('InvoiceGroup', {
  ...invoiceGroupBase,

  id: String,
});

PojosMetadataMap.create<InvoiceGroupVm>('InvoiceGroupVm', {
  ...invoiceGroupBase,

  id: String,
});

PojosMetadataMap.create<InvoiceGroupAm>('InvoiceGroupAm', {
  ...invoiceGroupBase,
});

const fieldTypes: Partial<
  Record<keyof InvoiceGroup & keyof InvoiceGroupVm & keyof InvoiceGroupAm, FieldConfig>
> = {
  description: { dataType: 'string', fieldType: 'optional' },
};

const invoiceGroupProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<InvoiceGroup, InvoiceGroupVm, InvoiceGroupAm>(
    mapper,
    'InvoiceGroup',
    'InvoiceGroupVm',
    'InvoiceGroupAm',
    fieldTypes,
  );
};

export default invoiceGroupProfile;
