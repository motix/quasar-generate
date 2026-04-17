import type { MappingProfile } from '@automapper/core';
import { afterMap } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateMaps } from 'utils/automapper.js';
import TaskStatus from 'utils/tasks/Task/TaskStatus.js';

import type { Todo, TodoAm, TodoVm } from 'models/finance/index.js';
import type { TaskFolder, TaskFolderVm } from 'models/tasks/index.js';

const todoBase: MapperMetadata<Todo> = {
  isPrivate: Boolean,
  isArchived: Boolean,
  name: String,
  urlFriendlyName: String,

  owner: 'MemberLite',
};

PojosMetadataMap.create<Todo>('Todo', {
  ...todoBase,

  id: String,
  createDate: Date,
  dueDate: Date,

  tasks: 'TaskFolder',
});

PojosMetadataMap.create<TodoVm>('TodoVm', {
  ...todoBase,

  id: String,
  createDate: String,
  dueDate: String,

  tasks: 'TaskFolderVm',
});

PojosMetadataMap.create<TodoAm>('TodoAm', {
  ...todoBase,

  createDate: Timestamp,
  dueDate: Timestamp,

  tasks: 'TaskFolderAm',
});

const fieldTypes: Partial<Record<keyof Todo & keyof TodoVm & keyof TodoAm, FieldConfig>> = {
  createDate: { dataType: 'date', fieldType: 'required' },
  dueDate: { dataType: 'date', fieldType: 'required' },
  owner: { dataType: 'asIs', fieldType: 'required' },
};

const todoProfile: MappingProfile = (mapper) => {
  configureAndCreateMaps<Todo, TodoVm, TodoAm>(mapper, 'Todo', 'TodoVm', 'TodoAm', fieldTypes, {
    apiModelToModel: [
      afterMap((_, d) => {
        function setStatusHelper(folder: TaskFolder) {
          folder.folders.forEach((value) => setStatusHelper(value));
          folder.tasks.forEach((value) => (value.statusHelper = new TaskStatus(value, [])));
        }

        setStatusHelper(d.tasks);
      }),
    ],
    modelToViewModel: [
      afterMap((_, d) => {
        function setStatusHelper(folder: TaskFolderVm) {
          folder.folders.forEach((value) => setStatusHelper(value));
          folder.tasks.forEach((value) => (value.statusHelper = new TaskStatus(value, [])));
        }

        setStatusHelper(d.tasks);
      }),
    ],
  });
};

export default todoProfile;
