import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import TaskStatus from 'utils/tasks/Task/TaskStatus.js';

import type { Todo, TodoAm, TodoVm } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';
import type { TaskFolder } from 'models/tasks/index.js';

import type { MapOptions } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';

const mapperOptions: MapOptions<Todo, TodoAm> = {
  apiModelToModelAfterMap: (_, destinations) => {
    function setStatusHelper(folder: TaskFolder) {
      folder.folders.forEach((value) => setStatusHelper(value));
      folder.tasks.forEach((value) => (value.statusHelper = new TaskStatus(value, [])));
    }

    destinations.forEach((todo) => {
      setStatusHelper(todo.tasks);
    });
  },
};

export const useTodosStore = useStore<Todo, TodoVm, TodoAm>(
  'Todos',
  'production_todos',
  productionMapper,
  'Todo',
  'TodoVm',
  'TodoAm',
  {
    mapperOptions,
  },
);

export const todosStoreDefaultSort: Readonly<QueryConstraint[]> = [orderBy('dueDate', 'desc')];
