import TaskStatus from 'utils/tasks/Task/TaskStatus.js';

import type { Project, ProjectAm } from 'models/finance/index.js';
import type { TaskFolder } from 'models/tasks/index.js';

import { storeOptions } from 'stores/finance/Projects.js';
import type { MapOptions } from 'stores/firebase-firestore/index.js';

const mapperOptions: MapOptions<Project, ProjectAm> = {
  apiModelToModelAfterMap: (_, destinations) => {
    function setStatusHelper(folder: TaskFolder) {
      folder.folders.forEach((value) => setStatusHelper(value));
      folder.tasks.forEach((value) => (value.statusHelper = new TaskStatus(value, [])));
    }

    destinations.forEach((project) => {
      setStatusHelper(project.tasks);
    });
  },
};

let projectsStoreExtended = false;

export function extendProjectsStore() {
  if (projectsStoreExtended) {
    return;
  }

  const currentApiModelToModelAfterMap = storeOptions.mapperOptions?.apiModelToModelAfterMap;

  storeOptions.mapperOptions = {
    ...(storeOptions.mapperOptions || {}),

    apiModelToModelAfterMap: (source, destination) => {
      currentApiModelToModelAfterMap && currentApiModelToModelAfterMap(source, destination);

      mapperOptions.apiModelToModelAfterMap &&
        mapperOptions.apiModelToModelAfterMap(source, destination);
    },
  };

  projectsStoreExtended = true;
}
