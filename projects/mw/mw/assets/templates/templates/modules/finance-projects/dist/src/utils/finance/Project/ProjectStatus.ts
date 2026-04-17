import DocumentStatusBase from 'utils/DocumentStatusBase.js';
import type { FinanceActionName, FinanceStatusName } from 'utils/finance/financeDocumentStatus.js';
import { buildFinanceStatuses } from 'utils/finance/financeDocumentStatus.js';

import type { Project, ProjectVm } from 'models/finance/index.js';
import type { UserRole } from 'models/firebase-auth/index.js';

declare module 'models/finance/projects.js' {
  interface Project {
    statusHelper: ProjectStatus<Project>;
  }

  interface ProjectVm {
    statusHelper: ProjectStatus<ProjectVm>;
  }
}

export type ProjectActionName = Extract<'', FinanceActionName>;
export const projectStatusNames = [
  'inProgress',
  'waitingForInvoice',
  'waitingForPayment',
  'done',
] as const;
export type ProjectStatusName = Extract<(typeof projectStatusNames)[number], FinanceStatusName>;

export default class ProjectStatus<T extends Project | ProjectVm> extends DocumentStatusBase<
  T,
  UserRole,
  ProjectStatusName,
  ProjectActionName
> {
  allStatuses = buildFinanceStatuses<ProjectStatusName, ProjectActionName>(...projectStatusNames);

  get statusName(): ProjectStatusName {
    if (this.container.finishDate < new Date()) {
      return 'done';
    }

    return 'inProgress';
  }
}
