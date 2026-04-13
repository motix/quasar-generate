import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type {
  ItemContribution,
  ItemContributionAm,
  ItemContributionVm,
} from 'models/production/index.js';

const itemContributionBase: MapperMetadata<ItemContribution> = {
  productionSalaryBase: Number,
  involvement: Number,
  priceFactor: Number,

  member: 'MemberLite',
  productionRole: 'ProductionRoleLite',
};

PojosMetadataMap.create<ItemContribution>('ItemContribution', itemContributionBase);

PojosMetadataMap.create<ItemContributionVm>('ItemContributionVm', itemContributionBase);

PojosMetadataMap.create<ItemContributionAm>('ItemContributionAm', itemContributionBase);

const fieldTypes: Partial<Record<keyof ItemContribution, FieldConfig>> = {
  productionSalaryBase: { dataType: 'number', fieldType: 'required' },
  involvement: { dataType: 'number', fieldType: 'required' },
  priceFactor: { dataType: 'number', fieldType: 'required' },
  member: { dataType: 'asIs', fieldType: 'required' },
  productionRole: { dataType: 'asIs', fieldType: 'required' },
};

const itemContributionProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<ItemContribution, ItemContributionVm, ItemContributionAm>(
    mapper,
    'ItemContribution',
    'ItemContributionVm',
    'ItemContributionAm',
    fieldTypes,
  );
};

export default itemContributionProfile;
