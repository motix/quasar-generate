import type {
  CollectionGroup,
  CollectionReference,
  DocumentReference,
  DocumentSnapshot,
} from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import type {
  MemberAm as Member,
  ProductionRoleAm as ProductionRole,
  ProductionSalaryDetailAm as ProductionSalaryDetail,
  ProductTypeAm as ProductType,
  ProjectAm as Project,
} from 'models/production/index.js';

export const productionRolesUpdater = onDocumentWritten(
  'production_productionRoles/{id}',
  async (event) => {
    if (!event.data?.before.exists) {
      return;
    }

    const productionRoleChange = event.data as Change<DocumentSnapshot<ProductionRole>>;
    const id = productionRoleChange.before.id;

    const db = getFirestore();

    // Update Member.defaultProductionRole

    if (productionRoleChange.after.data()?.name !== productionRoleChange.before.data()!.name) {
      const membersRef = db.collection('production_members') as CollectionReference<Member>;
      const membersSnapshot = await membersRef.where('defaultProductionRole.id', '==', id).get();

      info(
        '[production-productionRolesUpdater]',
        `Found ${membersSnapshot.size} members with default production role "${productionRoleChange.before.data()!.name}".`,
      );

      for (const snapshot of membersSnapshot.docs) {
        info(
          '[production-productionRolesUpdater]',
          `Updating member "${snapshot.data().fullName}"...`,
        );

        if (productionRoleChange.after.exists) {
          await snapshot.ref.set(
            {
              defaultProductionRole: { name: productionRoleChange.after.data()!.name },
            },
            { merge: true },
          );
        } else {
          await snapshot.ref.set({ defaultProductionRole: null }, { merge: true });
        }
      }

      if (productionRoleChange.after.exists) {
        info(
          '[production-productionRolesUpdater]',
          `Updated ${membersSnapshot.size} members with default production role "${productionRoleChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[production-productionRolesUpdater]',
          `Updated ${membersSnapshot.size} members with DELETED default production role "${productionRoleChange.before.data()!.name}".`,
        );
      }
    }

    // Update ProductionSalaryDetail.productionRole

    if (
      productionRoleChange.after.data()?.name !== productionRoleChange.before.data()!.name ||
      productionRoleChange.after.data()?.position !== productionRoleChange.before.data()!.position
    ) {
      const productionSalaryDetailsRef = db.collectionGroup(
        'productionSalaryDetails',
      ) as CollectionGroup<ProductionSalaryDetail>;
      const productionSalaryDetailsSnapshot = await productionSalaryDetailsRef
        .where('productionRole.id', '==', id)
        .get();

      info(
        '[production-productionRolesUpdater]',
        `Found ${productionSalaryDetailsSnapshot.size} production salary details with production role "${productionRoleChange.before.data()!.name}".`,
      );

      for (const snapshot of productionSalaryDetailsSnapshot.docs) {
        const productTypeRef = snapshot.ref.parent.parent as DocumentReference<ProductType>;
        const productTypeSnapshot = await productTypeRef.get();

        info(
          '[production-productionRolesUpdater]',
          `Updating production salary detail under product type "${productTypeSnapshot.data()!.name}"...`,
        );

        if (productionRoleChange.after.exists) {
          await snapshot.ref.set(
            {
              productionRole: {
                name: productionRoleChange.after.data()!.name,
                position: productionRoleChange.after.data()!.position,
              },
            },
            { merge: true },
          );
        } else {
          await snapshot.ref.delete();
        }
      }

      if (productionRoleChange.after.exists) {
        info(
          '[production-productionRolesUpdater]',
          `Updated ${productionSalaryDetailsSnapshot.size} production salary details with production role "${productionRoleChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[production-productionRolesUpdater]',
          `Updated ${productionSalaryDetailsSnapshot.size} production salary details with DELETED production role "${productionRoleChange.before.data()!.name}".`,
        );
      }
    }

    // Update ItemContribution.productionRole

    let matchedProjects = 0;

    if (productionRoleChange.after.data()?.name !== productionRoleChange.before.data()!.name) {
      await updateProjects();

      if (productionRoleChange.after.exists) {
        info(
          '[production-productionRolesUpdater]',
          `Updated ${matchedProjects} projects for production role "${productionRoleChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[production-productionRolesUpdater]',
          `Updated ${matchedProjects} projects for DELETED production role "${productionRoleChange.before.data()!.name}".`,
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
        '[production-productionRolesUpdater]',
        `Scanning ${projectsSnapshot.size} projects for production role "${productionRoleChange.before.data()!.name}"...`,
      );

      for (const snapshot of projectsSnapshot.docs) {
        let hasMatches = false;
        const project = snapshot.data();

        project.items.forEach((item) =>
          item.contributions.forEach((contribution) => {
            if (contribution.productionRole.id === id) {
              if (productionRoleChange.after.exists) {
                contribution.productionRole.name = productionRoleChange.after.data()!.name;
              } else {
                contribution.productionRole.name += ' * DELETED *';
              }

              hasMatches = true;
            }
          }),
        );

        if (hasMatches) {
          matchedProjects++;

          info('[production-productionRolesUpdater]', `Updating project "${project.name}"...`);

          await snapshot.ref.set({ items: project.items }, { merge: true });
        }
      }

      if (projectsSnapshot.docs.length === 100) {
        await updateProjects(projectsSnapshot.docs[projectsSnapshot.docs.length - 1]!.data().name);
      }
    }
  },
);
