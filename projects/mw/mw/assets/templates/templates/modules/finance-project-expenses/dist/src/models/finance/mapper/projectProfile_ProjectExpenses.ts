import type { MappingProfile } from '@automapper/core';
import { afterMap, forMember, mapWith } from '@automapper/core';
import { PojosMetadataMap } from '@automapper/pojos';

import { extendMapping, removeProperties } from 'utils/automapper.js';
import ExpenseStatus from 'utils/finance/Expense/ExpenseStatus.js';
import TransactionStatus from 'utils/finance/Transaction/TransactionStatus.js';

import type { Project, ProjectAm, ProjectVm } from 'models/finance/index.js';

PojosMetadataMap.create<Project>('Project', {
  expenses: ['Expense'],
});

PojosMetadataMap.create<ProjectVm>('ProjectVm', {
  expenses: ['ExpenseVm'],
});

PojosMetadataMap.create<ProjectAm>('ProjectAm', {
  expenses: ['ExpenseAm'],
});

const projectProfile: MappingProfile = (mapper) => {
  extendMapping<ProjectAm, Project>(
    mapper,
    'ProjectAm',
    'Project',
    removeProperties('expenses'),
    forMember(
      (d) => d.expenses,
      mapWith('Expense', 'ExpenseAm', (s) =>
        s.expenses.map((value) => ({
          id: '_',
          ...value,
        })),
      ),
    ),
    afterMap((_, d) => {
      d.expenses.forEach((expense) => {
        expense.statusHelper = new ExpenseStatus(expense, []);

        expense.transactions.forEach((transaction) => {
          transaction.statusHelper = new TransactionStatus(transaction, []);
        });
      });
    }),
  );

  extendMapping<Project, ProjectVm>(
    mapper,
    'Project',
    'ProjectVm',
    afterMap((_, d) => {
      d.expenses.forEach((expense) => {
        expense.statusHelper = new ExpenseStatus(expense, []);

        expense.transactions.forEach((transaction) => {
          transaction.statusHelper = new TransactionStatus(transaction, []);
        });
      });
    }),
  );
};

export default projectProfile;
