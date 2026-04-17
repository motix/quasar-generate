import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Project, ProjectAm, ProjectVm } from 'models/production/index.js';

const projectBase: MapperMetadata<Project> = {
  isPrivate: Boolean,
  isArchived: Boolean,
  name: String,
  urlFriendlyName: String,
  customerContact: String,
  description: String,

  owner: 'MemberLite',
  customer: 'CustomerLite',
};

PojosMetadataMap.create<Project>('Project', {
  ...projectBase,

  id: String,
  startDate: Date,
  finishDate: Date,

  items: ['Item'],
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  ...projectBase,

  id: String,
  startDate: String,
  finishDate: String,

  items: ['ItemVm'],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  ...projectBase,

  startDate: Timestamp,
  finishDate: Timestamp,

  items: ['ItemAm'],
});

const fieldTypes: Partial<Record<keyof Project, FieldConfig>> = {
  startDate: { dataType: 'date', fieldType: 'required' },
  finishDate: { dataType: 'date', fieldType: 'required' },
  description: { dataType: 'string', fieldType: 'optional' },
  owner: { dataType: 'asIs', fieldType: 'required' },
  customer: { dataType: 'asIs', fieldType: 'required' },
};

const projectProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Project, ProjectVm, ProjectAm>(
    mapper,
    'Project',
    'ProjectVm',
    'ProjectAm',
    fieldTypes,
  );
};

export default projectProfile;
