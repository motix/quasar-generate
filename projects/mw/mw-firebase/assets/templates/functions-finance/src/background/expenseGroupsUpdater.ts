import type { CollectionReference, DocumentSnapshot } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { info } from 'firebase-functions/logger';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import type {
  ExpenseAm as Expense,
  ExpenseGroupAm as ExpenseGroup,
  ProjectAm as Project,
} from 'models/finance/index.js';

export const expenseGroupsUpdater = onDocumentWritten(
  'finance_expenseGroups/{id}',
  async (event) => {
    if (!event.data?.before.exists) {
      return;
    }

    const expenseGroupChange = event.data as Change<DocumentSnapshot<ExpenseGroup>>;
    const id = expenseGroupChange.before.id;

    const db = getFirestore();

    // Update Expense.group

    if (expenseGroupChange.after.data()?.name !== expenseGroupChange.before.data()!.name) {
      // Project expenses

      const projectsRef = db.collection('finance_projects') as CollectionReference<Project>;
      const projectsSnapshot = await projectsRef
        .where('expenseGroupIds', 'array-contains', id)
        .get();

      info(
        '[finance-expenseGroupsUpdater]',
        `Found ${projectsSnapshot.size} projects for expense group "${expenseGroupChange.before.data()!.name}".`,
      );

      for (const snapshot of projectsSnapshot.docs) {
        const project = snapshot.data();

        info('[finance-expenseGroupsUpdater]', `Updating project "${project.name}"...`);

        for (const expense of project.expenses) {
          if (expense.group?.id === id) {
            info(
              '[finance-expenseGroupsUpdater]',
              '-->',
              `Updating project expense "${expense.code}" (${expense.content})...`,
            );

            if (expenseGroupChange.after.exists) {
              expense.group.name = expenseGroupChange.after.data()!.name;
            } else {
              expense.group.name += ' * DELETED *';
            }
          }
        }

        await snapshot.ref.set({ expenses: project.expenses }, { merge: true });
      }

      if (expenseGroupChange.after.exists) {
        info(
          '[finance-expenseGroupsUpdater]',
          `Updated ${projectsSnapshot.size} projects for expense group "${expenseGroupChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[finance-expenseGroupsUpdater]',
          `Updated ${projectsSnapshot.size} projects for DELETED expense group "${expenseGroupChange.before.data()!.name}".`,
        );
      }

      // General expenses

      const expensesRef = db.collection('finance_generalExpenses') as CollectionReference<Expense>;
      const expensesSnapshot = await expensesRef.where('group.id', '==', id).get();

      info(
        '[finance-expenseGroupsUpdater]',
        `Found ${expensesSnapshot.size} general expenses for expense group "${expenseGroupChange.before.data()!.name}".`,
      );

      for (const snapshot of expensesSnapshot.docs) {
        const expense = snapshot.data();

        info(
          '[finance-expenseGroupsUpdater]',
          `Updating general expense "${expense.code}" (${expense.content})...`,
        );

        if (expenseGroupChange.after.exists) {
          expense.group!.name = expenseGroupChange.after.data()!.name;
        } else {
          expense.group!.name += ' * DELETED *';
        }

        await snapshot.ref.set({ group: expense.group! }, { merge: true });
      }

      if (expenseGroupChange.after.exists) {
        info(
          '[finance-expenseGroupsUpdater]',
          `Updated ${expensesSnapshot.size} general expenses for expense group "${expenseGroupChange.after.data()!.name}".`,
        );
      } else {
        info(
          '[finance-expenseGroupsUpdater]',
          `Updated ${expensesSnapshot.size} general expenses for DELETED expense group "${expenseGroupChange.before.data()!.name}".`,
        );
      }
    }
  },
);
