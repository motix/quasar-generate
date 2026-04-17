import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import regenerateCode from 'utils/regenerateCode.js';

import type {
  ExpenseAm as Expense,
  ProjectAm as Project,
  SupplierAm as Supplier,
} from 'models/finance/index.js';

export const suppliersUpdater = onDocumentWritten('finance_suppliers/{id}', async (event) => {
  if (!event.data?.before.exists) {
    return;
  }

  const supplierChange = event.data as Change<DocumentSnapshot<Supplier>>;
  const id = supplierChange.before.id;

  const db = getFirestore();

  // Update Expense.supplier, Expense.code
  // Update Transaction.code

  if (
    supplierChange.after.data()?.code !== supplierChange.before.data()!.code ||
    supplierChange.after.data()?.name !== supplierChange.before.data()!.name
  ) {
    // Project expenses

    const projectsRef = db.collection('finance_projects') as CollectionReference<Project>;
    const projectsSnapshot = await projectsRef.where('supplierIds', 'array-contains', id).get();

    info(
      '[finance-suppliersUpdater]',
      `Found ${projectsSnapshot.size} projects for supplier "${supplierChange.before.data()!.name}".`,
    );

    for (const snapshot of projectsSnapshot.docs) {
      const project = snapshot.data();

      info('[finance-suppliersUpdater]', `Updating project "${project.name}"...`);

      for (const expense of project.expenses) {
        if (expense.supplier.id === id) {
          info(
            '[finance-suppliersUpdater]',
            '-->',
            `Updating project expense "${expense.code}" (${expense.content})...`,
          );

          if (supplierChange.after.exists) {
            expense.supplier.name = supplierChange.after.data()!.name;

            if (supplierChange.after.data()?.code !== supplierChange.before.data()!.code) {
              expense.supplier.code = supplierChange.after.data()!.code;

              expense.code = await regenerateCode(
                expense.code,
                supplierChange.after.data()!.code.toUpperCase(),
              );

              for (const transaction of expense.transactions) {
                transaction.code = await regenerateCode(
                  transaction.code,
                  supplierChange.after.data()!.code.toUpperCase(),
                );
              }
            }
          } else {
            expense.supplier.name += ' * DELETED *';
          }
        }
      }

      await snapshot.ref.set({ expenses: project.expenses }, { merge: true });
    }

    if (supplierChange.after.exists) {
      info(
        '[finance-suppliersUpdater]',
        `Updated ${projectsSnapshot.size} projects for supplier "${supplierChange.after.data()!.name}".`,
      );
    } else {
      info(
        '[finance-suppliersUpdater]',
        `Updated ${projectsSnapshot.size} projects for DELETED supplier "${supplierChange.before.data()!.name}".`,
      );
    }

    // General expenses

    const expensesRef = db.collection('finance_generalExpenses') as CollectionReference<Expense>;
    const expensesSnapshot = await expensesRef.where('supplier.id', '==', id).get();

    info(
      '[finance-suppliersUpdater]',
      `Found ${expensesSnapshot.size} general expenses for supplier "${supplierChange.before.data()!.name}".`,
    );

    for (const snapshot of expensesSnapshot.docs) {
      const expense = snapshot.data();

      info(
        '[finance-suppliersUpdater]',
        `Updating general expense "${expense.code}" (${expense.content})...`,
      );

      if (supplierChange.after.exists) {
        expense.supplier.name = supplierChange.after.data()!.name;

        if (supplierChange.after.data()?.code !== supplierChange.before.data()!.code) {
          expense.supplier.code = supplierChange.after.data()!.code;

          expense.code = await regenerateCode(
            expense.code,
            supplierChange.after.data()!.code.toUpperCase(),
          );

          for (const transaction of expense.transactions) {
            transaction.code = await regenerateCode(
              transaction.code,
              supplierChange.after.data()!.code.toUpperCase(),
            );
          }
        }
      } else {
        expense.supplier.name += ' * DELETED *';
      }

      await snapshot.ref.set({ supplier: expense.supplier, code: expense.code }, { merge: true });
    }

    if (supplierChange.after.exists) {
      info(
        '[finance-suppliersUpdater]',
        `Updated ${expensesSnapshot.size} general expense for supplier "${supplierChange.after.data()!.name}".`,
      );
    } else {
      info(
        '[finance-suppliersUpdater]',
        `Updated ${expensesSnapshot.size} general expense for DELETED supplier "${supplierChange.before.data()!.name}".`,
      );
    }
  }
});
