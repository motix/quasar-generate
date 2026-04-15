import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import type {
  ProductTypeAm as ProductType,
  ProjectAm as Project,
} from 'models/production/index.js';

export const productTypesUpdater = onDocumentWritten(
  'production_productTypes/{id}',
  async (event) => {
    if (!event.data?.before.exists) {
      return;
    }

    const productTypeChange = event.data as Change<DocumentSnapshot<ProductType>>;
    const id = productTypeChange.before.id;

    const db = getFirestore();

    // Update Item.productType

    let matchedProjects = 0;

    if (productTypeChange.after.data()?.name !== productTypeChange.before.data()!.name) {
      await updateProjects();

      if (productTypeChange.after.exists) {
        info(
          '[production-productTypesUpdater]',
          `Updated ${matchedProjects} projects for product type "${productTypeChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[production-productTypesUpdater]',
          `Updated ${matchedProjects} projects for DELETED product type "${productTypeChange.before.data()!.name}".`,
        );
      }
    }

    async function updateProjects(name?: string) {
      const projectsRef = db.collection('production_projects') as CollectionReference<Project>;
      let projectsQuery = projectsRef.orderBy('name').limit(100);

      if (name) {
        projectsQuery = projectsQuery.startAfter(name);
      }

      const projectsSnapshot = await projectsQuery.get();

      info(
        '[production-productTypesUpdater]',
        `Scanning ${projectsSnapshot.size} projects for product type "${productTypeChange.before.data()!.name}"...`,
      );

      for (const snapshot of projectsSnapshot.docs) {
        let hasMatches = false;
        const project = snapshot.data();

        project.items.forEach((item) => {
          if (item.productType.id === id) {
            if (productTypeChange.after.exists) {
              item.productType.name = productTypeChange.after.data()!.name;
            } else {
              item.productType.name += ' * DELETED *';
            }

            hasMatches = true;
          }
        });

        if (hasMatches) {
          matchedProjects++;

          info('[production-productTypesUpdater]', `Updating project "${project.name}"...`);

          await snapshot.ref.set({ items: project.items }, { merge: true });
        }
      }

      if (projectsSnapshot.docs.length === 100) {
        await updateProjects(projectsSnapshot.docs[projectsSnapshot.docs.length - 1]!.data().name);
      }
    }
  },
);
