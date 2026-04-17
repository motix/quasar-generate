import { buildStatuses, PREDEFINED_STATUSES } from 'utils/DocumentStatusBase.js';

import type { UserRole } from 'models/firebase-auth/index.js';

const tasksActions = ['implement', 'test', 'reject', 'close', 'reopen'] as const;
export type TasksActionName = (typeof tasksActions)[number];

export type TasksStatusName = 'new' | 'implemented' | 'tested' | 'closed';

export const buildTasksStatusesExtensions: ((
  buttonOverrides: Parameters<
    typeof buildStatuses<UserRole, never, never, TasksStatusName, TasksActionName>
  >['1'],
) => void)[] = [];

export function buildTasksStatuses<
  TStatusName extends TasksStatusName,
  TActionName extends TasksActionName,
>(...statuses: TStatusName[]) {
  const buttonOverrides: Parameters<
    typeof buildStatuses<UserRole, TStatusName, TActionName, TasksStatusName, TasksActionName>
  >['1'] = {
    implement: {
      label: 'Implement',
      color: 'primary',
      icon: 'fal fa-check-double',
    },
    test: {
      label: 'Test',
      color: 'positive',
      icon: 'fal fa-thumbs-up',
    },
    reject: {
      label: 'Reject',
      color: 'negative',
      icon: 'fal fa-thumbs-down',
    },
    close: {
      label: 'Close',
      color: 'muted',
      icon: 'fal fa-circle-xmark',
    },
    reopen: {
      label: 'Re-open',
      color: 'primary',
      icon: 'fal fa-circle-check',
    },
  };

  buildTasksStatusesExtensions.forEach((value) => value(buttonOverrides));

  return buildStatuses<UserRole, TStatusName, TActionName, TasksStatusName, TasksActionName>(
    [...tasksActions],
    buttonOverrides,
    // statusOverrides
    (buttons) => ({
      new: {
        ...PREDEFINED_STATUSES.new,
        buttons: [buttons.implement, buttons.close],
      },
      implemented: {
        text: 'Implemented',
        textColor: 'blue-1',
        backgroundColor: 'primary',
        buttons: [buttons.test, buttons.reject, buttons.close],
      },
      tested: {
        ...PREDEFINED_STATUSES.done,
        text: 'Tested',
        buttons: [buttons.reject, buttons.close],
      },
      closed: {
        ...PREDEFINED_STATUSES.cancelled,
        text: 'Closed',
        buttons: [buttons.reopen],
      },
    }),
    ...statuses,
  );
}
