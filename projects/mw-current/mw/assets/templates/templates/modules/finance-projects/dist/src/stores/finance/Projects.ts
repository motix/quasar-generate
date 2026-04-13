import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import ProjectStatus from 'utils/finance/Project/ProjectStatus.js';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import type { StoreOptions } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';

// Export storeOptions to allow extending from other modules
export const storeOptions: StoreOptions<Project, ProjectVm, ProjectAm> = {
  mapperOptions: {
    apiModelToModelAfterMap: (_, destinations) => {
      destinations.forEach((project) => {
        project.statusHelper = new ProjectStatus(project, []);
      });
    },
  },
};

export const useProjectsStore = useStore<Project, ProjectVm, ProjectAm>(
  'Projects',
  'finance_projects',
  financeMapper,
  'Project',
  'ProjectVm',
  'ProjectAm',
  storeOptions,
);

export function useInstantProjectsStore() {
  return useStore<Project, ProjectVm, ProjectAm>(
    `InstantProjects_${uid()}`,
    'finance_projects',
    financeMapper,
    'Project',
    'ProjectVm',
    'ProjectAm',
    storeOptions,
  )();
}

export const projectsStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('finishDate', 'desc'),
  orderBy('name'),
];
