import { date } from 'quasar';

import type { QueryConstraint } from 'firebase/firestore';
import { orderBy, Timestamp, where } from 'firebase/firestore';

import { sumBy } from 'lodash-es';

import PayrollStatus from 'utils/hr/payroll/PayrollStatus.js';

import type { Payroll, PayrollAm, PayrollDetailVm, PayrollVm } from 'models/hr/index.js';
import hrMapper from 'models/hr/mapper/hrMapper.js';

import { useStore } from 'stores/firebase-firestore/index.js';
import { membersStoreDefaultSort, useInstantMembersStore } from 'stores/hr/Members.js';

import { generateCode } from 'services/global/index.js';

import { requiredConfigEntries } from 'composables/useConfig.js';

import { projectsStoreDefaultSort, useInstantProjectsStore } from './Projects.js';

export const usePayrollsStore = useStore<Payroll, PayrollVm, PayrollAm>(
  'Payrolls',
  'hr_payrolls',
  hrMapper,
  'Payroll',
  'PayrollVm',
  'PayrollAm',
  {
    mapperOptions: {
      apiModelToModelAfterMap: (_, destinations) => {
        destinations.forEach((value) => {
          value.statusHelper = new PayrollStatus(value, []);
        });
      },
    },
    beforeCreate: async ({ doc: docVm }) => {
      // Code

      docVm.code ||= await generateCode(
        'PR',
        date.formatDate(new Date(docVm.year as number, (docVm.month as number) - 1, 1), '.YYYY.MM'),
      );

      // Details

      const [members, projects] = await Promise.all([
        loadMembers(),
        loadProjects(docVm.year as number, docVm.month as number),
      ]);

      docVm.details = members.map((member) => {
        const productionSalary = sumBy(
          projects,
          (project) =>
            project.productionSalaries.find((salary) => salary.member.id === member.id)?.amount ||
            0,
        );

        const detail: PayrollDetailVm = {
          fullName: member.fullName,
          baseSalary: member.baseSalary || 0,
          productionSalary,
          workingDays: docVm.workingDays,
          bonus: 0,
          socialInsuranceSalary: member.socialInsuranceSalary || 0,
          personalIncomeTax: member.personalIncomeTax || 0,
          payUnionDues: member.payUnionDues,
          adjustment: 0,
        };

        return detail;
      });
    },
  },
);

export const payrollsStoreDefaultSort: Readonly<QueryConstraint[]> = [
  orderBy('year', 'desc'),
  orderBy('month', 'desc'),
  orderBy('code', 'desc'),
];

async function loadMembers() {
  const store = useInstantMembersStore();

  await store.loadAllDocs({
    queryConstraints: [
      where('isActive', '==', true),
      where('isIncludedInPayroll', '==', true),
      ...membersStoreDefaultSort,
    ],
  });

  const docs = store.docs;

  store.$dispose();

  return docs;
}

async function loadProjects(year: number, month: number) {
  const store = useInstantProjectsStore();
  const { payday } = requiredConfigEntries('payday');
  const endDate = new Date(year, month - 1, payday);
  const startDate = date.addToDate(endDate, { days: 1, months: -1 });

  await store.loadAllDocs({
    queryConstraints: [
      where('finishDate', '>=', Timestamp.fromDate(startDate)),
      where('finishDate', '<=', Timestamp.fromDate(endDate)),
      ...projectsStoreDefaultSort,
    ],
  });

  const docs = store.docs;

  store.$dispose();

  return docs;
}
