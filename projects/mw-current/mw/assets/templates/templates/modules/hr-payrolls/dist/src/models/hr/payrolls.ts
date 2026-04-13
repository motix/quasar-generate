import type { Timestamp } from 'firebase/firestore';

import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';
import type { MemberLite } from 'models/hr/index.js';

// Models

export interface Project extends DocModel {
  name: string;
  finishDate: Date;

  // Map
  productionSalaries: ProductionSalary[];
}

export interface ProductionSalary {
  amount: number;

  // Map
  member: MemberLite;
}

export interface Payroll extends DocModel {
  code: string;
  year: number;
  month: number;
  isCompleted: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isCancelled: boolean;
  socialInsurancePercent: number;
  unionDuesPercent: number;
  workingDays: number;

  // Map
  details: PayrollDetail[];
}

export interface PayrollDetail {
  fullName: string;
  baseSalary: number;
  productionSalary: number;
  workingDays: number;
  bonus: number;
  socialInsuranceSalary: number;
  personalIncomeTax: number;
  payUnionDues: boolean;
  adjustment: number;
}

// View Models

export interface PayrollVm extends Omit<
  DocViewModel<Payroll>,
  | 'code'
  | 'year'
  | 'month'
  | 'socialInsurancePercent'
  | 'unionDuesPercent'
  | 'workingDays'
  | 'details'
  | 'statusHelper'
> {
  code?: string;
  year: number | string;
  month: number | string;
  socialInsurancePercent: number | string;
  unionDuesPercent: number | string;
  workingDays: number | string;

  // Map
  details: PayrollDetailVm[];
}

export interface PayrollDetailVm extends Omit<
  PayrollDetail,
  'workingDays' | 'bonus' | 'personalIncomeTax' | 'adjustment'
> {
  workingDays: number | string;
  bonus: number | string;
  personalIncomeTax: number | string;
  adjustment: number | string;
}

// API Models

export interface ProjectAm extends Omit<DocApiModel<Project>, 'finishDate' | 'productionSalaries'> {
  finishDate: Timestamp;

  // Map
  productionSalaries: ProductionSalaryAm[];
}

export type ProductionSalaryAm = ProductionSalary;

export interface PayrollAm extends Omit<DocApiModel<Payroll>, 'details' | 'statusHelper'> {
  // Map
  details: PayrollDetailAm[];
}

export type PayrollDetailAm = PayrollDetail;
