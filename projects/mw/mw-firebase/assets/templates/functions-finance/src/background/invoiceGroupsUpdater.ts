import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import type {
  InvoiceAm as Invoice,
  InvoiceGroupAm as InvoiceGroup,
  ProjectAm as Project,
} from 'models/finance/index.js';

export const invoiceGroupsUpdater = onDocumentWritten(
  'finance_invoiceGroups/{id}',
  async (event) => {
    if (!event.data?.before.exists) {
      return;
    }

    const invoiceGroupChange = event.data as Change<DocumentSnapshot<InvoiceGroup>>;
    const id = invoiceGroupChange.before.id;

    const db = getFirestore();

    // Update Invoice.group

    if (invoiceGroupChange.after.data()?.name !== invoiceGroupChange.before.data()!.name) {
      // Project invoices

      const projectsRef = db.collection('finance_projects') as CollectionReference<Project>;
      const projectsSnapshot = await projectsRef
        .where('invoiceGroupIds', 'array-contains', id)
        .get();

      info(
        '[finance-invoiceGroupsUpdater]',
        `Found ${projectsSnapshot.size} projects for invoice group "${invoiceGroupChange.before.data()!.name}".`,
      );

      for (const snapshot of projectsSnapshot.docs) {
        const project = snapshot.data();

        info('[finance-invoiceGroupsUpdater]', `Updating project "${project.name}"...`);

        for (const quotation of project.quotations) {
          if (quotation.invoice?.group?.id === id) {
            info(
              '[finance-invoiceGroupsUpdater]',
              '-->',
              `Updating project invoice "${quotation.invoice.code}"...`,
            );

            if (invoiceGroupChange.after.exists) {
              quotation.invoice.group.name = invoiceGroupChange.after.data()!.name;
            } else {
              quotation.invoice.group.name += ' * DELETED *';
            }
          }
        }

        await snapshot.ref.set({ quotations: project.quotations }, { merge: true });
      }

      if (invoiceGroupChange.after.exists) {
        info(
          '[finance-invoiceGroupsUpdater]',
          `Updated ${projectsSnapshot.size} projects for invoice group "${invoiceGroupChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[finance-invoiceGroupsUpdater]',
          `Updated ${projectsSnapshot.size} projects for DELETED invoice group "${invoiceGroupChange.before.data()!.name}".`,
        );
      }

      // General invoices

      const invoicesRef = db.collection('finance_generalInvoices') as CollectionReference<Invoice>;
      const invoicesSnapshot = await invoicesRef.where('group.id', '==', id).get();

      info(
        '[finance-invoiceGroupsUpdater]',
        `Found ${invoicesSnapshot.size} general invoices for invoice group "${invoiceGroupChange.before.data()!.name}".`,
      );

      for (const snapshot of invoicesSnapshot.docs) {
        const invoice = snapshot.data();

        info(
          '[finance-invoiceGroupsUpdater]',
          `Updating general invoice "${invoice.code}" (${invoice.content})...`,
        );

        if (invoiceGroupChange.after.exists) {
          invoice.group!.name = invoiceGroupChange.after.data()!.name;
        } else {
          invoice.group!.name += ' * DELETED *';
        }

        await snapshot.ref.set({ group: invoice.group! }, { merge: true });
      }

      if (invoiceGroupChange.after.exists) {
        info(
          '[finance-invoiceGroupsUpdater]',
          `Updated ${invoicesSnapshot.size} general invoices for invoice group "${invoiceGroupChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[finance-invoiceGroupsUpdater]',
          `Updated ${invoicesSnapshot.size} general invoices for DELETED invoice group "${invoiceGroupChange.before.data()!.name}".`,
        );
      }
    }
  },
);
