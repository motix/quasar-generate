import type { QueryConstraint } from 'firebase/firestore';
import { orderBy } from 'firebase/firestore';

import type { Project, ProjectAm, ProjectVm } from 'models/production/index.js';
import productionMapper from 'models/production/mapper/productionMapper.js';

import type { StoreOptions } from 'stores/firebase-firestore/index.js';
import { useStore } from 'stores/firebase-firestore/index.js';
import { useInstantProductionRoleSortableLitesStore } from 'stores/production/ProductionRoleSortableLites.js';

// Export storeOptions to allow extending from other modules
export const storeOptions: StoreOptions<Project, ProjectVm, ProjectAm> = {
  beforeUpdate: async ({ doc, isViewModel }) => {
    if (!isViewModel) {
      return;
    }

    const productionRolesStore = useInstantProductionRoleSortableLitesStore();

    await productionRolesStore.loadAllDocs({ queryConstraints: [] });
    const productionRoles = productionRolesStore.docs;

    productionRolesStore.$dispose();

    doc.items.sort((a, b) => {
      if (a.number) {
        if (b.number) {
          if (a.number === b.number) {
            return a.title > b.title ? 1 : -1;
          }

          return a.number > b.number ? 1 : -1;
        }

        return 1;
      }

      if (b.number) {
        return -1;
      }

      return a.title > b.title ? 1 : -1;
    });

    doc.items.forEach((item) => {
      item.contributions.sort((a, b) => {
        const aRole = productionRoles.find((value) => value.id === a.productionRole?.id);
        const bRole = productionRoles.find((value) => value.id === b.productionRole?.id);

        if (aRole && bRole) {
          return aRole.position - bRole.position;
        } else {
          return 0;
        }
      });
    });
  },
};

export const useProjectsStore = useStore<Project, ProjectVm, ProjectAm>(
  'Projects',
  'production_projects',
  productionMapper,
  'Project',
  'ProjectVm',
  'ProjectAm',
  storeOptions,
);

export const projectsStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('finishDate', 'desc'),
  orderBy('name'),
];
