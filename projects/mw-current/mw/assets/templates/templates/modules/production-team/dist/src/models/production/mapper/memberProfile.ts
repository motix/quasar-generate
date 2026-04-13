import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Member, MemberAm } from 'models/production/index.js';

const memberBase: MapperMetadata<Member> = {
  uid: String,
  isActive: Boolean,
  email: String,
  fullName: String,
  photoUrl: String,

  defaultProductionRole: 'ProductionRoleLite',
};

PojosMetadataMap.create<Member>('Member', {
  ...memberBase,

  id: String,
});

PojosMetadataMap.create<MemberAm>('MemberAm', memberBase);

const fieldTypes: Partial<Record<keyof Member, FieldConfig>> = {
  defaultProductionRole: { dataType: 'asIs', fieldType: 'optional' },
};

const memberProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Member, never, MemberAm>(mapper, 'Member', null, 'MemberAm', fieldTypes);
};

export default memberProfile;
