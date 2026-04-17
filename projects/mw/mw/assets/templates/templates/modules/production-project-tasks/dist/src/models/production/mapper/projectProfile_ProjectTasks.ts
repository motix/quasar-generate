import type { MappingProfile } from '@automapper/core';
import { afterMap } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { extendMapping } from 'utils/automapper.js';
import TaskStatus from 'utils/tasks/Task/TaskStatus.js';

import type { Project, ProjectAm, ProjectVm } from 'models/production/index.js';
import type { TaskFolder, TaskFolderVm } from 'models/tasks/index.js';

PojosMetadataMap.create<Project>('Project', {
  tasks: 'TaskFolder',
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  tasks: 'TaskFolderVm',
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  tasks: 'TaskFolderAm',
});

const projectProfile: MappingProfile = (mapper) => {
  extendMapping<ProjectAm, Project>(
    mapper,
    'ProjectAm',
    'Project',
    afterMap((_, d) => {
      function setStatusHelper(folder: TaskFolder) {
        folder.folders.forEach((value) => setStatusHelper(value));
        folder.tasks.forEach((value) => (value.statusHelper = new TaskStatus(value, [])));
      }

      setStatusHelper(d.tasks);
    }),
  );

  extendMapping<Project, ProjectVm>(
    mapper,
    'Project',
    'ProjectVm',
    afterMap((_, d) => {
      function setStatusHelper(folder: TaskFolderVm) {
        folder.folders.forEach((value) => setStatusHelper(value));
        folder.tasks.forEach((value) => (value.statusHelper = new TaskStatus(value, [])));
      }

      setStatusHelper(d.tasks);
    }),
  );
};

export default projectProfile;
