import type { Ref } from 'vue';

import type { Member, Todo } from 'models/production/index.js';
import type { TaskFolder } from 'models/tasks/index.js';

import useFirebaseAuth from 'composables/useFirebaseAuth.js';

export default function useTodoVisibleToUser(authenticatedMember: Ref<Member | null>) {
  // Private

  function taskFolderVisibleToUser(folder: TaskFolder, memberId: string): boolean {
    return (
      folder.tasks.some(
        (task) =>
          task.owner.id === memberId || task.assignedTo.some((value) => value.id === memberId),
      ) || folder.folders.some((value) => taskFolderVisibleToUser(value, memberId))
    );
  }

  // Composables

  const { hasRole } = useFirebaseAuth();

  // Methods

  function todoVisibleToUser(todo: Todo) {
    const memberId = authenticatedMember.value?.id;

    return (
      !todo.isPrivate ||
      hasRole('finance') ||
      (memberId &&
        (todo.owner.id === memberId ||
          todo.tasks.tasks.some(
            (task) =>
              task.owner.id === memberId || task.assignedTo.some((value) => value.id === memberId),
          ) ||
          todo.tasks.folders.some((value) => taskFolderVisibleToUser(value, memberId))))
    );
  }

  return {
    todoVisibleToUser,
  };
}
