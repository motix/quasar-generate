import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { Item, ItemAm, ItemVm } from 'models/finance/index.js';

const itemBase: MapperMetadata<Item> = {
  isProductionOnly: Boolean,
  isFinanceOnly: Boolean,
  isQuotationOnly: Boolean,
  title: String,
  number: String,
  description: String,
  productType: String,
  quantity: Number,
  productionSalaryUnitPrice: Number,
  unitPrice: Number,
};

PojosMetadataMap.create<Item>('Item', itemBase);

PojosMetadataMap.create<ItemVm>('ItemVm', itemBase);

PojosMetadataMap.create<ItemAm>('ItemAm', itemBase);

const fieldTypes: Partial<Record<keyof Item, FieldConfig>> = {
  number: { dataType: 'string', fieldType: 'optional' },
  description: { dataType: 'string', fieldType: 'optional' },
  productType: { dataType: 'string', fieldType: 'optional' },
  quantity: { dataType: 'number', fieldType: 'required' },
  productionSalaryUnitPrice: { dataType: 'number', fieldType: 'optional' },
  unitPrice: { dataType: 'number', fieldType: 'optional' },
};

const itemProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<Item, ItemVm, ItemAm>(
    mapper,
    'Item',
    'ItemVm',
    'ItemAm',
    fieldTypes,
  );
};

export default itemProfile;
