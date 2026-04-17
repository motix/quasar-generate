import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Member, MemberAm, MemberVm } from 'models/crud-pages/index.js';

const memberBase: MapperMetadata<Member> = {
  uid: String,
  isActive: Boolean,
  email: String,
  fullName: String,
  photoUrl: String,
  slackId: String,
  inviteToFinanceChannels: Boolean,
};

PojosMetadataMap.create<Member>('Member', {
  ...memberBase,

  id: String,
});

PojosMetadataMap.create<MemberVm>('MemberVm', {
  ...memberBase,

  id: String,
});

PojosMetadataMap.create<MemberAm>('MemberAm', memberBase);

const fieldTypes: Partial<Record<keyof Member & keyof MemberVm & keyof MemberAm, FieldConfig>> = {
  slackId: { dataType: 'string', fieldType: 'optional' },
};

const memberProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Member, MemberVm, MemberAm>(
    mapper,
    'Member',
    'MemberVm',
    'MemberAm',
    fieldTypes,
  );
};

export default memberProfile;
