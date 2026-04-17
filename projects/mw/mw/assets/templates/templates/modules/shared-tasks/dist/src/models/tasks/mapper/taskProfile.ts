import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { Task, TaskAm, TaskVm } from 'models/tasks/index.js';

const taskBase: MapperMetadata<Task> = {
  key: String,
  title: String,
  content: String,
  isImplemented: Boolean,
  isTested: Boolean,
  isClosed: Boolean,

  owner: 'MemberLite',
  assignedTo: ['MemberLite'],
};

PojosMetadataMap.create<Task>('Task', {
  ...taskBase,

  createDate: Date,

  comments: ['TaskComment'],
});

PojosMetadataMap.create<TaskVm>('TaskVm', {
  ...taskBase,

  createDate: String,

  comments: ['TaskCommentVm'],
});

PojosMetadataMap.create<TaskAm>('TaskAm', {
  ...taskBase,

  createDate: Timestamp,

  comments: ['TaskCommentAm'],
});

const fieldTypes: Partial<Record<keyof Task & keyof TaskVm & keyof TaskAm, FieldConfig>> = {
  createDate: { dataType: 'date', fieldType: 'required' },
  owner: { dataType: 'asIs', fieldType: 'required' },
  assignedTo: { dataType: 'asIs', fieldType: 'required' },
};

const taskProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<Task, TaskVm, TaskAm>(
    mapper,
    'Task',
    'TaskVm',
    'TaskAm',
    fieldTypes,
  );
};

export default taskProfile;
