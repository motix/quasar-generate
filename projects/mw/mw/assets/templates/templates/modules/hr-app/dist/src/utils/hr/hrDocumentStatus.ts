import { buildStatuses, PREDEFINED_STATUSES } from 'utils/DocumentStatusBase.js';

import type { UserRole } from 'models/firebase-auth/index.js';

const hrActions = ['complete', 'approve', 'reject', 'cancel', 'reset'] as const;
export type HrActionName = (typeof hrActions)[number];

export type HrStatusName = 'new' | 'waitingForApproval' | 'approved' | 'rejected' | 'cancelled';

export function buildHrStatuses<TStatusName extends HrStatusName, TActionName extends HrActionName>(
  ...statuses: TStatusName[]
) {
  return buildStatuses<UserRole, TStatusName, TActionName, HrStatusName, HrActionName>(
    [...hrActions],
    // buttonOverrides
    {
      complete: { roles: ['manager', 'hr'] },
      approve: { roles: ['manager'] },
      reject: { roles: ['manager'] },
      cancel: { roles: ['manager', 'hr'] },
      reset: { roles: ['manager'] },
    },
    // statusOverrides
    (buttons) => ({
      new: {
        buttons: [buttons.complete, buttons.cancel],
      },
      waitingForApproval: {
        ...PREDEFINED_STATUSES.internalWaiting,
        text: 'Waiting for Approval',
        buttons: [buttons.approve, buttons.reject, buttons.cancel, buttons.reset],
      },
      approved: {
        ...PREDEFINED_STATUSES.done,
        text: 'Approved',
        buttons: [buttons.cancel, buttons.reset],
      },
      rejected: {
        ...PREDEFINED_STATUSES.rejected,
        buttons: [buttons.complete, buttons.cancel, buttons.reset],
      },
      cancelled: {
        buttons: [buttons.reset],
      },
    }),
    ...statuses,
  );
}
