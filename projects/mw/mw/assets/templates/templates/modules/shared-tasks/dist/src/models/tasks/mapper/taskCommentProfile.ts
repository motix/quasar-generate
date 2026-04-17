import type { MappingProfile } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { Timestamp } from 'firebase/firestore';

import type { FieldConfig, MapperMetadata } from 'utils/automapper.js';
import { configureAndCreateNoneIdMaps } from 'utils/automapper.js';

import type { TaskComment, TaskCommentAm, TaskCommentVm } from 'models/tasks/index.js';

const taskCommentBase: MapperMetadata<TaskComment> = {
  action: String,
  content: String,

  member: 'MemberLite',
};

PojosMetadataMap.create<TaskComment>('TaskComment', {
  ...taskCommentBase,

  createDate: Date,
});

PojosMetadataMap.create<TaskCommentVm>('TaskCommentVm', {
  ...taskCommentBase,

  createDate: String,
});

PojosMetadataMap.create<TaskCommentAm>('TaskCommentAm', {
  ...taskCommentBase,

  createDate: Timestamp,
});

const fieldTypes: Partial<
  Record<keyof TaskComment & keyof TaskCommentVm & keyof TaskCommentAm, FieldConfig>
> = {
  createDate: { dataType: 'date', fieldType: 'required' },
  member: { dataType: 'asIs', fieldType: 'required' },
};

const taskCommentProfile: MappingProfile = (mapper) => {
  configureAndCreateNoneIdMaps<TaskComment, TaskCommentVm, TaskCommentAm>(
    mapper,
    'TaskComment',
    'TaskCommentVm',
    'TaskCommentAm',
    fieldTypes,
  );
};

export default taskCommentProfile;
