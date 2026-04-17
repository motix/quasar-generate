import { sortBy, sumBy, uniqBy } from 'lodash-es';

import type { TaskStatusName } from 'utils/tasks/Task/TaskStatus.js';

import type { MemberLite } from 'models/<%= prompts.tasksNamespace %>/index.js';
import type { TaskFolder } from 'models/tasks/index.js';

export default function useTaskCalculator() {
  function statusCount(folders: TaskFolder[], status: TaskStatusName): number {
    return sumBy(folders, (item) => {
      return (
        item.tasks.filter((task) => task.statusHelper.statusName === status).length +
        statusCount(item.folders, status)
      );
    });
  }

  function totalNew(folder: TaskFolder) {
    return statusCount([folder], 'new');
  }

  function totalImplemented(folder: TaskFolder) {
    return statusCount([folder], 'implemented');
  }

  function totalTested(folder: TaskFolder) {
    return statusCount([folder], 'tested');
  }

  function totalClosed(folder: TaskFolder) {
    return statusCount([folder], 'closed');
  }

  function allAssignedTo(folder: TaskFolder): MemberLite[] {
    return sortBy(
      uniqBy(
        [
          ...folder.folders.flatMap((value) => allAssignedTo(value)),
          ...folder.tasks.flatMap((value) => value.assignedTo),
        ],
        (value) => value.id,
      ),
      (value) => value.fullName,
    );
  }

  return {
    totalNew,
    totalImplemented,
    totalTested,
    totalClosed,
    allAssignedTo,
  };
}
