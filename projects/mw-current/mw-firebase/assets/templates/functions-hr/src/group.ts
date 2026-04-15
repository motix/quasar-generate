declare module 'firebase-admin/auth' {
  interface ManagedRolesToken {
    manager: boolean;
    hr: boolean;
  }
}

export * from './callable/changePayrollStatus.js';
