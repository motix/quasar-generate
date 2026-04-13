import type { MappingProfile } from '@automapper/core';
import { addProfile, createMapper } from '@automapper/core';
import { pojos } from '@automapper/pojos';

import taskCommentProfile from 'models/tasks/mapper/taskCommentProfile.js';
import taskFolderProfile from 'models/tasks/mapper/taskFolderProfile.js';
import taskProfile from 'models/tasks/mapper/taskProfile.js';

export const tasksProfile: MappingProfile = (mapper) => {
  taskFolderProfile(mapper);
  taskProfile(mapper);
  taskCommentProfile(mapper);
};

const tasksMapper = createMapper({
  strategyInitializer: pojos(),
});

addProfile(tasksMapper, tasksProfile);

export default tasksMapper;
