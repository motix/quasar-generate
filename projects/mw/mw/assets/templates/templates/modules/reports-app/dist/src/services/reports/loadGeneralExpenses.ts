import type { CollectionReference, QueryConstraint } from 'firebase/firestore';
import { collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';

import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Expense, ExpenseAm } from 'models/finance/index.js';
import financeMapper from 'models/finance/mapper/financeMapper.js';

import { getFirestore } from 'services/firebase.js';

export default async function loadGeneralExpenses(
  startDate: Date,
  endDate: Date,
  ...queryConstraints: QueryConstraint[]
) {
  const db = getFirestore();
  const expensesRef = collection(db, 'finance_generalExpenses') as CollectionReference<ExpenseAm>;
  const expensesQuery = query(
    expensesRef,
    where('issueDate', '>=', Timestamp.fromDate(startDate)),
    where('issueDate', '<=', Timestamp.fromDate(endDate)),
    where('isCompleted', '==', true),
    where('isCancelled', '==', false),
    orderBy('issueDate'),
    orderBy('createDate'),
    ...queryConstraints,
  );
  const expensesSnapshot = await getDocs(expensesQuery);
  const expenseAndIds = expensesSnapshot.docs.map((expenseSnapshot) => [
    expenseSnapshot.data(),
    expenseSnapshot.id,
  ]);
  const expenseAms = expenseAndIds.map((expenseAndId) => expenseAndId[0] as ExpenseAm);
  const expenseIdMap = new Map(expenseAndIds as Iterable<readonly [ExpenseAm, string]>);
  const extraArgs = () => ({ idMap: expenseIdMap });
  const expenses = financeMapper.mapArray<ExpenseAm, Expense>(expenseAms, 'ExpenseAm', 'Expense', {
    extraArgs,
  });

  expenses.forEach((expense) => {
    expense.statusHelper = new ExpenseStatus(expense, []);

    expense.transactions.forEach((transaction) => {
      transaction.statusHelper = new TransactionStatus(transaction, []);
    });
  });

  return expenses;
}
