import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';

PojosMetadataMap.create<Project>('Project', {
  rawSlackMessages: ['RawSlackMessage'],
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  rawSlackMessages: ['RawSlackMessage'],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  rawSlackMessages: ['RawSlackMessage'],
});

const projectProfile: MappingProfile = () => {
  //
};

export default projectProfile;
