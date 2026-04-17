import type { MappingProfile } from '@automapper/core';
import { forMember, mapWith } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { extendMapping, removeProperties } from 'utils/automapper.js';

import type { Quotation, QuotationAm, QuotationVm } from 'models/finance/index.js';

PojosMetadataMap.create<Quotation>('Quotation', {
  invoice: 'Invoice',
});

PojosMetadataMap.create<QuotationVm>('QuotationVm', {
  invoice: 'InvoiceVm',
});

PojosMetadataMap.create<QuotationAm>('QuotationAm', {
  invoice: 'InvoiceAm',
});

const quotationProfile: MappingProfile = (mapper) => {
  extendMapping<QuotationAm, Quotation>(
    mapper,
    'QuotationAm',
    'Quotation',
    removeProperties('invoice'),
    forMember(
      (d) => d.invoice,
      mapWith('Invoice', 'InvoiceAm', (s) =>
        s.invoice
          ? {
              id: '_',
              ...s.invoice,
            }
          : undefined,
      ),
    ),
  );

  extendMapping<Quotation, QuotationAm>(
    mapper,
    'Quotation',
    'QuotationAm',
    removeProperties('invoice'),
    forMember(
      (d) => d.invoice,
      mapWith('InvoiceAm', 'Invoice', (s) => s.invoice || null),
    ),
  );

  extendMapping<QuotationVm, QuotationAm>(
    mapper,
    'QuotationVm',
    'QuotationAm',
    removeProperties('invoice'),
    forMember(
      (d) => d.invoice,
      mapWith('InvoiceAm', 'InvoiceVm', (s) => s.invoice || null),
    ),
  );
};

export default quotationProfile;
