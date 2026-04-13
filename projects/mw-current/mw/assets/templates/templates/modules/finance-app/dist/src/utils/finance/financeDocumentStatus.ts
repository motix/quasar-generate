import { buildStatuses, PREDEFINED_STATUSES } from 'utils/DocumentStatusBase.js';

import type { UserRole } from 'models/firebase-auth/index.js';

const financeActions = [
  'complete',
  'approve',
  'reject',
  'approveAndConfirm',
  'sendToCustomer',
  'confirm',
  'clear',
  'cancel',
  'reset',
] as const;
export type FinanceActionName = (typeof financeActions)[number];

export type FinanceStatusName =
  | 'inProgress'
  | 'waitingForInvoice'
  | 'waitingForPayment'
  | 'done'
  | 'new'
  | 'waitingForApproval'
  | 'waitingForInitialApprovalAndConfirm'
  | 'approved'
  | 'rejected'
  | 'waitingToSend'
  | 'sentToCustomer'
  | 'waitingForConfirmation'
  | 'confirmed'
  | 'pending'
  | 'cleared'
  | 'cancelled';

export function buildFinanceStatuses<
  TStatusName extends FinanceStatusName,
  TActionName extends FinanceActionName,
>(...statuses: TStatusName[]) {
  return buildStatuses<UserRole, TStatusName, TActionName, FinanceStatusName, FinanceActionName>(
    [...financeActions],
    // buttonOverrides
    {
      complete: { roles: ['manager', 'finance'] },
      approve: { roles: ['manager'] },
      reject: { roles: ['manager'] },
      approveAndConfirm: {
        label: 'Approve & Confirm',
        color: 'positive',
        icon: 'fal fa-comment-check',
        roles: ['manager'],
      },
      sendToCustomer: {
        label: 'Send to Customer',
        color: 'primary',
        icon: 'fal fa-share',
        roles: ['manager', 'finance'],
      },
      confirm: {
        label: 'Confirm',
        color: 'positive',
        icon: 'fal fa-comment-check',
        roles: ['manager', 'finance'],
      },
      clear: {
        label: 'Clear',
        color: 'positive',
        icon: 'fal fa-broom',
        roles: ['manager', 'finance'],
      },
      cancel: { roles: ['manager', 'finance'] },
      reset: { roles: ['manager'] },
    },
    // statusOverrides
    (buttons) => ({
      inProgress: {
        ...PREDEFINED_STATUSES.new,
        text: 'In Progress',
      },
      waitingForInvoice: {
        ...PREDEFINED_STATUSES.internalWaiting,
        text: 'Waiting for Invoice',
      },
      waitingForPayment: {
        ...PREDEFINED_STATUSES.externalWaiting,
        text: 'Waiting for Payment',
      },
      new: {
        buttons: [buttons.complete, buttons.cancel],
      },
      waitingForApproval: {
        ...PREDEFINED_STATUSES.internalWaiting,
        text: 'Waiting for Approval',
        buttons: [buttons.approve, buttons.reject, buttons.cancel, buttons.reset],
      },
      waitingForInitialApprovalAndConfirm: {
        ...PREDEFINED_STATUSES.internalWaiting,
        text: 'Waiting for Approval',
        buttons: [buttons.approve, buttons.approveAndConfirm, buttons.cancel],
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
      waitingToSend: {
        ...PREDEFINED_STATUSES.internalWaiting,
        text: 'Waiting to Send',
        buttons: [buttons.sendToCustomer, buttons.cancel, buttons.reset],
      },
      sentToCustomer: {
        ...PREDEFINED_STATUSES.done,
        text: 'Sent to Customer',
        buttons: [buttons.cancel, buttons.reset],
      },
      waitingForConfirmation: {
        ...PREDEFINED_STATUSES.externalWaiting,
        text: 'Waiting for Confirmation',
        buttons: [buttons.confirm, buttons.cancel, buttons.reset],
      },
      confirmed: {
        ...PREDEFINED_STATUSES.done,
        text: 'Confirmed',
        buttons: [buttons.cancel, buttons.reset],
      },
      pending: {
        ...PREDEFINED_STATUSES.internalWaiting,
        text: 'Pending',
        buttons: [buttons.clear, buttons.cancel],
      },
      cleared: {
        ...PREDEFINED_STATUSES.done,
        text: 'Cleared',
        buttons: [buttons.cancel, buttons.reset],
      },
      cancelled: {
        buttons: [buttons.reset],
      },
    }),
    ...statuses,
  );
}
