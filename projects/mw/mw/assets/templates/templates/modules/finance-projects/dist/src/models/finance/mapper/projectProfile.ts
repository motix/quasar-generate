import type { MappingProfile } from '@automapper/core';
import { afterMap } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';
import ProjectStatus from 'utils/finance/Project/ProjectStatus.js';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';

const projectBase: MapperMetadata<Project> = {
  isArchived: Boolean,
  name: String,
  urlFriendlyName: String,
  customerContact: String,
  owner: String,
  isInvoiceRequired: Boolean,
  discount: Number,
  vatPercent: Number,
  vatableAmount: Number,

  customer: 'CustomerLite',

  supplierIds: [String],
};

PojosMetadataMap.create<Project>('Project', {
  ...projectBase,

  id: String,
  finishDate: Date,

  items: ['Item'],
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  ...projectBase,

  id: String,
  finishDate: String,

  items: ['ItemVm'],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  ...projectBase,

  finishDate: Timestamp,

  items: ['ItemAm'],
});

const fieldTypes: Partial<Record<keyof Project, FieldConfig>> = {
  finishDate: { dataType: 'date', fieldType: 'required' },
  discount: { dataType: 'number', fieldType: 'optional' },
  vatPercent: { dataType: 'number', fieldType: 'optional' },
  vatableAmount: { dataType: 'number', fieldType: 'optional' },
  customer: { dataType: 'asIs', fieldType: 'required' },
};

const projectProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Project, ProjectVm, ProjectAm>(
    mapper,
    'Project',
    'ProjectVm',
    'ProjectAm',
    fieldTypes,
    {
      apiModelToModel: [
        afterMap((_, d) => {
          d.statusHelper = new ProjectStatus(d, []);
        }),
      ],
      modelToViewModel: [
        afterMap((_, d) => {
          d.statusHelper = new ProjectStatus(d, []);
        }),
      ],
    },
  );
};

export default projectProfile;
