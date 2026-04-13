import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { TasksActionName, TasksStatusName } from 'utils/tasks/tasksDocumentStatus.js';
import { buildTasksStatuses } from 'utils/tasks/tasksDocumentStatus.js';

import type { UserRole } from 'models/firebase-auth/index.js';
import type { Task, TaskVm } from 'models/tasks/index.js';

declare module 'models/tasks/index.js' {
  interface Task {
    statusHelper: TaskStatus<Task>;
  }

  interface TaskVm {
    statusHelper: TaskStatus<TaskVm>;
  }
}

export type TaskActionName = Extract<
  'implement' | 'test' | 'reject' | 'close' | 'reopen',
  TasksActionName
>;
export const taskStatusNames = ['new', 'implemented', 'tested', 'closed'] as const;
export type TaskStatusName = Extract<(typeof taskStatusNames)[number], TasksStatusName>;

export default class TaskStatus<T extends Task | TaskVm> extends DocumentStatusBase<
  T,
  UserRole,
  TaskStatusName,
  TaskActionName
> {
  allStatuses = buildTasksStatuses<TaskStatusName, TaskActionName>(...taskStatusNames);

  get statusName() {
    if (this.container.isClosed) {
      return 'closed';
    }

    if (this.container.isImplemented) {
      if (this.container.isTested) {
        return 'tested';
      }

      return 'implemented';
    }

    return 'new';
  }
}
