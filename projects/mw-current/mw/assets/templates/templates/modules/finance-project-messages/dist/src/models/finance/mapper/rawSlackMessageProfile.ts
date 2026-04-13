import type { MappingProfile } from '@automapper/core';
import { createMap } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

PojosMetadataMap.create<Message>('RawSlackMessage', {
  text: String,
  ts: String,
  user: String,
});

const rawSlackMessageProfile: MappingProfile = (mapper) => {
  createMap(mapper, 'RawSlackMessage', 'RawSlackMessage');
};

export default rawSlackMessageProfile;
