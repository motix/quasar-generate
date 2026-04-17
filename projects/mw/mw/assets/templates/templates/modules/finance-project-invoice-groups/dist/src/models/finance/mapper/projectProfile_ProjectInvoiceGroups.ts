import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';

PojosMetadataMap.create<Project>('Project', {
  invoiceGroupIds: [String],
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  invoiceGroupIds: [String],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  invoiceGroupIds: [String],
});

const projectProfile: MappingProfile = () => {};

export default projectProfile;
