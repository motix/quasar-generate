import { buildStatuses, PREDEFINED_STATUSES } from 'utils/DocumentStatusBase.js';

import type { UserRole } from 'models/firebase-auth/index.js';

const productionActions = ['implement', 'test', 'reject', 'close', 'reopen'] as const;
export type ProductionActionName = (typeof productionActions)[number];

export type ProductionStatusName = 'new' | 'implemented' | 'tested' | 'closed';

export function buildProductionStatuses<
  TStatusName extends ProductionStatusName,
  TActionName extends ProductionActionName,
>(...statuses: TStatusName[]) {
  return buildStatuses<
    UserRole,
    TStatusName,
    TActionName,
    ProductionStatusName,
    ProductionActionName
  >(
    [...productionActions],
    // buttonOverrides
    {
      implement: {
        label: 'Implement',
        color: 'primary',
        icon: 'fal fa-check-double',
        roles: ['production'],
      },
      test: {
        label: 'Test',
        color: 'positive',
        icon: 'fal fa-thumbs-up',
        roles: ['production'],
      },
      reject: {
        label: 'Reject',
        color: 'negative',
        icon: 'fal fa-thumbs-down',
        roles: ['production'],
      },
      close: {
        label: 'Close',
        color: 'muted',
        icon: 'fal fa-circle-xmark',
        roles: ['production'],
      },
      reopen: {
        label: 'Re-open',
        color: 'primary',
        icon: 'fal fa-circle-check',
        roles: ['production'],
      },
    },
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
