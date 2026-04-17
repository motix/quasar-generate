import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { UserAccount, UserAccountAm } from '../index.js';

const userAccountBase: MapperMetadata<UserAccount> = {
  uid: String,
  email: String,
  displayName: String,
  photoUrl: String,
  claims: [String],
};

PojosMetadataMap.create<UserAccount>('UserAccount', {
  ...userAccountBase,

  id: String,
});

PojosMetadataMap.create<UserAccountAm>('UserAccountAm', userAccountBase);

const userAccountProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<UserAccount, never, UserAccountAm>(
    mapper,
    'UserAccount',
    null,
    'UserAccountAm',
    {},
  );
};

export default userAccountProfile;
