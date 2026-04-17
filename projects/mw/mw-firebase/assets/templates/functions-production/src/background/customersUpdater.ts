import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import type { CustomerAm as Customer, ProjectAm as Project } from 'models/production/index.js';

export const customersUpdater = onDocumentWritten('production_customers/{id}', async (event) => {
  if (!event.data?.before.exists) {
    return;
  }

  const customerChange = event.data as Change<DocumentSnapshot<Customer>>;
  const id = customerChange.before.id;

  const db = getFirestore();

  // Update Project.customer

  if (
    customerChange.after.data()?.code !== customerChange.before.data()!.code ||
    customerChange.after.data()?.name !== customerChange.before.data()!.name
  ) {
    const projectsRef = db.collection('production_projects') as CollectionReference<Project>;
    const projectsSnapshot = await projectsRef.where('customer.id', '==', id).get();

    info(
      '[production-customersUpdater]',
      `Found ${projectsSnapshot.size} projects for customer "${customerChange.before.data()!.name}".`,
    );

    for (const snapshot of projectsSnapshot.docs) {
      const project = snapshot.data();

      info('[production-customersUpdater]', `Updating project "${project.name}"...`);

      if (customerChange.after.exists) {
        project.customer.code = customerChange.after.data()!.code;
        project.customer.name = customerChange.after.data()!.name;
      } else {
        project.customer.name += ' * DELETED *';
      }

      await snapshot.ref.set(
        { customer: { code: project.customer.code, name: project.customer.name } },
        { merge: true },
      );
    }

    if (customerChange.after.exists) {
      info(
        '[production-customersUpdater]',
        `Updated ${projectsSnapshot.size} projects for customer "${customerChange.after.data()!.name}".`,
      );
    } else {
      info(
        '[production-customersUpdater]',
        `Updated ${projectsSnapshot.size} projects for DELETED customer "${customerChange.before.data()!.name}".`,
      );
    }
  }
});
