import { uid } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Project, ProjectAm } from 'models/hr/index.js';
import hrMapper from 'models/hr/mapper/hrMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';

export function useInstantProjectsStore() {
  return useStore<Project, never, ProjectAm>(
    `InstantProjects_${uid()}`,
    'hr_projects',
    hrMapper,
    'Project',
    '',
    'ProjectAm',
  )();
}

export const projectsStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('finishDate'),
  orderBy('name'),
];
