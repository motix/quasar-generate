import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';

PojosMetadataMap.create<Project>('Project', {
  expenseGroupIds: [String],
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  expenseGroupIds: [String],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  expenseGroupIds: [String],
});

const projectProfile: MappingProfile = () => {};

export default projectProfile;
