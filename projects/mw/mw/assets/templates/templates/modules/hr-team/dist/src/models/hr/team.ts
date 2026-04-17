import type { Timestamp } from 'firebase/firestore';

import type { DocApiModel, DocModel } from 'models/firebase-firestore/index.js';

// Models

export interface Member extends DocModel {
  isActive: boolean;
  email: string;
  fullName: string;
  photoUrl: string;
  isIncludedInPayroll: boolean;
  startDate?: Date;
  contractStartDate?: Date;
  contractExpiration?: Date;
  baseSalary?: number;
  socialInsuranceSalary?: number;
  personalIncomeTax?: number;
  payUnionDues: boolean;
  bankAccountNumber?: string;
  bankName?: string;
}

export interface MemberLite {
  id: string;
  fullName: string;
}

// View Models

export interface MemberVm extends Omit<
  Member,
  | 'startDate'
  | 'contractStartDate'
  | 'contractExpiration'
  | 'baseSalary'
  | 'socialInsuranceSalary'
  | 'personalIncomeTax'
  | 'bankAccountNumber'
  | 'bankName'
> {
  startDate: string | null;
  contractStartDate: string | null;
  contractExpiration: string | null;
  baseSalary: number | string | null;
  socialInsuranceSalary: number | string | null;
  personalIncomeTax: number | string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
}

// API Models

export interface MemberAm extends Omit<
  DocApiModel<Member>,
  | 'startDate'
  | 'contractStartDate'
  | 'contractExpiration'
  | 'baseSalary'
  | 'socialInsuranceSalary'
  | 'personalIncomeTax'
  | 'bankAccountNumber'
  | 'bankName'
> {
  startDate?: Timestamp;
  contractStartDate?: Timestamp | null;
  contractExpiration?: Timestamp | null;
  baseSalary?: number | null;
  socialInsuranceSalary?: number | null;
  personalIncomeTax?: number | null;
  bankAccountNumber?: string | null;
  bankName?: string | null;
}
