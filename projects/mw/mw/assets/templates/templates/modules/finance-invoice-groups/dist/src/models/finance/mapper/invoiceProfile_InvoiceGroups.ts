import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig } from 'utils/automapper.js';
import { configureAndExtendMaps } from 'utils/automapper.js';

import type { Invoice, InvoiceAm, InvoiceVm } from 'models/finance/index.js';

PojosMetadataMap.create<Invoice>('Invoice', {
  group: 'InvoiceGroupLite',
});

PojosMetadataMap.create<InvoiceVm>('InvoiceVm', {
  group: 'InvoiceGroupLite',
});

PojosMetadataMap.create<InvoiceAm>('InvoiceAm', {
  group: 'InvoiceGroupLite',
});

const fieldTypes: Partial<Record<keyof Invoice & keyof InvoiceVm & keyof InvoiceAm, FieldConfig>> =
  {
    group: { dataType: 'asIs', fieldType: 'optional' },
  };

const invoiceProfile: MappingProfile = (mapper) => {
  configureAndExtendMaps<Invoice, InvoiceVm, InvoiceAm>(
    mapper,
    'Invoice',
    'InvoiceVm',
    'InvoiceAm',
    fieldTypes,
  );
};

export default invoiceProfile;
