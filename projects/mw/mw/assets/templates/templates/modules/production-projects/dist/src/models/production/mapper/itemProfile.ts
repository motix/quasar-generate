import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { Item, ItemAm, ItemVm } from 'models/production/index.js';

const itemBase: MapperMetadata<Item> = {
  title: String,
  number: String,
  description: String,
  quantity: Number,

  productType: 'ProductTypeLite',
};

PojosMetadataMap.create<Item>('Item', {
  ...itemBase,

  contributions: ['ItemContribution'],
});

PojosMetadataMap.create<ItemVm>('ItemVm', {
  ...itemBase,

  contributions: ['ItemContributionVm'],
});

PojosMetadataMap.create<ItemAm>('ItemAm', {
  ...itemBase,

  contributions: ['ItemContributionAm'],
});

const fieldTypes: Partial<Record<keyof Item, FieldConfig>> = {
  number: { dataType: 'string', fieldType: 'optional' },
  description: { dataType: 'string', fieldType: 'optional' },
  quantity: { dataType: 'number', fieldType: 'required' },
  productType: { dataType: 'asIs', fieldType: 'required' },
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
