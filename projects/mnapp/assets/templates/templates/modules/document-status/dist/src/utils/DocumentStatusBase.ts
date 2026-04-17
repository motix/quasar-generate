import { intersection } from 'lodash-es';

interface Button<TUserRole, TActionName> {
  label: string;
  color: string;
  icon: string;
  roles: TUserRole[];
  action: TActionName;
}

interface Status<TUserRole, TActionName> {
  text: string;
  textColor: string;
  backgroundColor: string;
  buttons: Button<TUserRole, TActionName>[];
}

export const PREDEFINED_BUTTONS: Record<string, Omit<Button<never, never>, 'roles' | 'action'>> = {
  complete: {
    label: 'Complete',
    color: 'primary',
    icon: 'fal fa-check-double',
  },
  approve: {
    label: 'Approve',
    color: 'positive',
    icon: 'fal fa-thumbs-up',
  },
  reject: {
    label: 'Reject',
    color: 'purple',
    icon: 'fal fa-turn-down-left',
  },
  cancel: {
    label: 'Cancel',
    color: 'negative',
    icon: 'fal fa-times',
  },
  reset: {
    label: 'Reset',
    color: 'muted',
    icon: 'fal fa-power-off',
  },
};

export const PREDEFINED_STATUSES: Record<string, Omit<Status<never, never>, 'buttons'>> = {
  new: {
    text: 'New',
    textColor: 'cyan-1',
    backgroundColor: 'cyan',
  },
  internalWaiting: {
    text: 'Internal Waiting',
    textColor: 'amber-1',
    backgroundColor: 'amber',
  },
  externalWaiting: {
    text: 'External Waiting',
    textColor: 'red-1',
    backgroundColor: 'red-10',
  },
  done: {
    text: 'Done',
    textColor: 'green-1',
    backgroundColor: 'green',
  },
  rejected: {
    text: 'Rejected',
    textColor: 'purple-1',
    backgroundColor: 'purple',
  },
  cancelled: {
    text: 'Cancelled',
    textColor: 'grey-1',
    backgroundColor: 'grey',
  },
};

function buildBaseButtons<TUserRole, TActionName extends string>(
  ...actions: TActionName[]
): Record<TActionName, Button<TUserRole, TActionName>> {
  const result: Record<string, Button<TUserRole, TActionName>> = {};

  const defaultButton: Omit<Button<never, never>, 'roles' | 'action'> = {
    label: '',
    color: '',
    icon: '',
  };

  for (const action of actions) {
    result[action] = {
      ...(PREDEFINED_BUTTONS[action] || defaultButton),
      roles: [],
      action: action,
    };
  }

  return result;
}

function buildBaseStatuses<TUserRole, TStatusName extends string, TActionName extends string>(
  ...statuses: TStatusName[]
): Record<TStatusName, Status<TUserRole, TActionName>> {
  const result: Record<string, Status<TUserRole, TActionName>> = {};

  const defaultStatus: Omit<Status<never, never>, 'buttons'> = {
    text: '',
    textColor: '',
    backgroundColor: '',
  };

  for (const status of statuses) {
    result[status] = {
      ...(PREDEFINED_STATUSES[status] || defaultStatus),
      buttons: [],
    };
  }

  return result;
}

export function buildStatuses<
  TUserRole,
  TStatusName extends TGroupStatusName,
  TActionName extends TGroupActionName,
  TGroupStatusName extends string,
  TGroupActionName extends string,
>(
  groupActions: TGroupActionName[],
  buttonOverrides: Partial<Record<TGroupActionName, Partial<Button<TUserRole, TGroupActionName>>>>,
  statusOverrides: (
    buttons: Record<TGroupActionName, Button<TUserRole, TGroupActionName>>,
  ) => Partial<Record<TGroupStatusName, Partial<Status<TUserRole, TGroupActionName>>>>,
  ...statuses: TStatusName[]
): Record<TStatusName, Status<TUserRole, TActionName>> {
  const buttons = buildBaseButtons<TUserRole, TGroupActionName>(...groupActions);

  for (const action of groupActions) {
    buttons[action] = Object.assign(buttons[action], buttonOverrides[action] || {});
  }

  const statusOverridesResult = statusOverrides(buttons);

  const result = buildBaseStatuses<TUserRole, TStatusName, TActionName>(...statuses);

  for (const status of statuses) {
    result[status] = Object.assign(result[status], statusOverridesResult[status] || {});
  }

  return result;
}

export default abstract class DocumentStatusBase<
  T,
  TUserRole extends string,
  TStatusName extends string,
  TActionName extends string,
> {
  protected container: T;
  protected userRoles: TUserRole[] = [];
  protected abstract allStatuses: Record<TStatusName, Status<TUserRole, TActionName>>;

  constructor(container: T, userRoles: TUserRole[]) {
    this.container = container;
    this.userRoles = userRoles;
  }

  abstract get statusName(): TStatusName;

  protected get status() {
    return this.allStatuses[this.statusName];
  }

  get text() {
    return this.status.text;
  }

  get textColor() {
    return this.status.textColor;
  }

  get backgroundColor() {
    return this.status.backgroundColor;
  }

  get buttons() {
    return this.userRoles.includes('admin' as TUserRole)
      ? this.status.buttons
      : this.status.buttons.filter(
          (button) => intersection(this.userRoles, button.roles).length > 0,
        );
  }

  static newContainer<
    T extends {
      statusHelper: TDocumentStatus;
    },
    TDocumentStatus extends DocumentStatusBase<T, TUserRole, TStatusName, TActionName>,
    TUserRole extends string,
    TStatusName extends string,
    TActionName extends string,
  >(
    documentStatusConstructor: new (container: T, userRoles: TUserRole[]) => TDocumentStatus,
    container: Omit<T, 'statusHelper'>,
    userRoles: TUserRole[],
  ) {
    (container as T).statusHelper = new documentStatusConstructor(container as T, userRoles);

    return container as T;
  }

  setUserRoles(userRoles: TUserRole[]) {
    this.userRoles = userRoles;
  }
}
