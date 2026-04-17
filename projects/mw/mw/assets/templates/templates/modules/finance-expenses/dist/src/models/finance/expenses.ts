import type { Timestamp } from 'firebase/firestore';

import type {
  SupplierLite,
  Transaction,
  TransactionAm,
  TransactionVm,
} from 'models/finance/index.js';
import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExpenseExtendedFields {} // To be augmented

export interface Expense extends DocModel {
  isArchived: boolean;
  code: string;
  createDate: Date;
  issueDate: Date;
  isCompleted: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isCancelled: boolean;
  isCapitalWithdrawal: boolean;
  isExternal: boolean;
  supplierExtraInfo?: string;
  content: string;
  discount?: number;
  vatPercent?: number;
  vatableAmount?: number;
  secondVatPercent?: number;
  secondVatableAmount?: number;
  vatAdjustment?: number;
  notes?: string;

  // Map
  supplier: SupplierLite;
  details: ExpenseDetail[];
  transactions: Transaction[];

  // Functional
  listKey?: string;
}

export interface ExpenseDetail {
  content: string;
  quantity: number;
  unitPrice: number;
}

// View Models

export interface ExpenseVm extends Omit<
  DocViewModel<Expense>,
  | 'createDate'
  | 'issueDate'
  | 'supplierExtraInfo'
  | 'discount'
  | 'vatPercent'
  | 'vatableAmount'
  | 'secondVatPercent'
  | 'secondVatableAmount'
  | 'vatAdjustment'
  | 'notes'
  | 'supplier'
  | 'details'
  | 'transactions'
  | 'listKey'
  | 'statusHelper'
  // In the extension eslint won't report this error because `ExpenseExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof ExpenseExtendedFields
> {
  createDate: string;
  issueDate: string;
  supplierExtraInfo: string | null;
  discount: number | string | null;
  vatPercent: number | string | null;
  vatableAmount: number | string | null;
  secondVatPercent: number | string | null;
  secondVatableAmount: number | string | null;
  vatAdjustment: number | string | null;
  notes: string | null;

  // Map
  supplier?: SupplierLite;
  details: ExpenseDetailVm[];
  transactions: TransactionVm[];

  // Functional
  listKey: string | null;
}

export interface ExpenseDetailVm extends Omit<ExpenseDetail, 'quantity' | 'unitPrice'> {
  quantity: number | string;
  unitPrice: number | string;

  // Frontend Customizations
  key?: string; // Used for list editing
}

// API Models

export interface ExpenseAm extends Omit<
  DocApiModel<Expense>,
  | 'createDate'
  | 'issueDate'
  | 'supplierExtraInfo'
  | 'discount'
  | 'vatPercent'
  | 'vatableAmount'
  | 'secondVatPercent'
  | 'secondVatableAmount'
  | 'vatAdjustment'
  | 'notes'
  | 'details'
  | 'transactions'
  | 'listKey'
  | 'statusHelper'
  // In the extension eslint won't report this error because `ExpenseExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof ExpenseExtendedFields
> {
  createDate: Timestamp;
  issueDate: Timestamp;
  supplierExtraInfo?: string | null;
  discount?: number | null;
  vatPercent?: number | null;
  vatableAmount?: number | null;
  secondVatPercent?: number | null;
  secondVatableAmount?: number | null;
  vatAdjustment?: number | null;
  notes?: string | null;

  // Map
  details: ExpenseDetailAm[];
  transactions: TransactionAm[];

  // Functional
  listKey?: string | null;
}

export type ExpenseDetailAm = ExpenseDetail;
