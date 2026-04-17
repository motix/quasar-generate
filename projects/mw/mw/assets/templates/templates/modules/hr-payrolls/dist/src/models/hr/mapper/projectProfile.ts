import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';

import type { Project, ProjectAm } from 'models/hr/index.js';

const projectBase: MapperMetadata<Project> = {
  name: String,
};

PojosMetadataMap.create<Project>('Project', {
  ...projectBase,

  id: String,
  finishDate: Date,

  productionSalaries: ['ProductionSalary'],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  ...projectBase,

  finishDate: Timestamp,

  productionSalaries: ['ProductionSalaryAm'],
});

const fieldTypes: Partial<Record<keyof Project & keyof ProjectAm, FieldConfig>> = {
  finishDate: { dataType: 'date', fieldType: 'required' },
};

const projectProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Project, never, ProjectAm>(
    mapper,
    'Project',
    null,
    'ProjectAm',
    fieldTypes,
  );
};

export default projectProfile;
