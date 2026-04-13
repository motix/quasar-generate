import type { MappingProfile } from '@automapper/core';
import { forMember, mapWith } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import type { MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { TaskFolder, TaskFolderAm, TaskFolderVm } from 'models/tasks/index.js';

const taskFolderBase: MapperMetadata<TaskFolder> = {
  key: String,
  name: String,
};

PojosMetadataMap.create<TaskFolder>('TaskFolder', {
  ...taskFolderBase,

  tasks: ['Task'],
});

PojosMetadataMap.create<TaskFolderVm>('TaskFolderVm', {
  ...taskFolderBase,

  tasks: ['TaskVm'],
});

PojosMetadataMap.create<TaskFolderAm>('TaskFolderAm', {
  ...taskFolderBase,

  tasks: ['TaskAm'],
});

const taskFolderProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<TaskFolder, TaskFolderVm, TaskFolderAm>(
    mapper,
    'TaskFolder',
    'TaskFolderVm',
    'TaskFolderAm',
    {},
    {
      apiModelToModel: [
        forMember(
          (d) => d.folders,
          mapWith('TaskFolder', 'TaskFolderAm', (s) => s.folders),
        ),
      ],
      modelToViewModel: [
        forMember(
          (d) => d.folders,
          mapWith('TaskFolderVm', 'TaskFolder', (s) => s.folders),
        ),
      ],
      modelToApiModel: [
        forMember(
          (d) => d.folders,
          mapWith('TaskFolderAm', 'TaskFolder', (s) => s.folders),
        ),
      ],
      viewModelToApiModel: [
        forMember(
          (d) => d.folders,
          mapWith('TaskFolderAm', 'TaskFolderVm', (s) => s.folders),
        ),
      ],
    },
  );
};

export default taskFolderProfile;
