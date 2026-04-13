import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Member, MemberAm } from 'models/finance/index.js';

const memberBase: MapperMetadata<Member> = {
  uid: String,
  isActive: Boolean,
  email: String,
  fullName: String,
  photoUrl: String,
};

PojosMetadataMap.create<Member>('Member', {
  ...memberBase,

  id: String,
});

PojosMetadataMap.create<MemberAm>('MemberAm', memberBase);

const memberProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Member, never, MemberAm>(mapper, 'Member', null, 'MemberAm', {});
};

export default memberProfile;
