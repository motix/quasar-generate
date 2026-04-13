import type { Timestamp } from 'firebase/firestore';

import type { FinanceAccountLite } from 'models/finance/index.js';
import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

export const transactionTypes = [
  'Receipt',
  'Receipt Refund',
  'Payment',
  'Payment Refund',
  'Transfer',
] as const;

export type TransactionType = (typeof transactionTypes)[number];

// Models

export interface Transaction extends DocModel {
  isArchived: boolean;
  code: string;
  createDate: Date;
  issueDate: Date;
  type: TransactionType;
  isCleared: boolean;
  isCancelled: boolean;
  content: string;
  notes?: string;

  // Map
  sourceFinanceAccount?: FinanceAccountLite;
  destinationFinanceAccount?: FinanceAccountLite;
  details: TransactionDetail[];

  // Functional
  listKey?: string;
}

export interface TransactionDetail {
  content: string;
  quantity: number;
  unitPrice: number;
}

// View Models

export interface TransactionVm extends Omit<
  DocViewModel<Transaction>,
  | 'createDate'
  | 'issueDate'
  | 'notes'
  | 'sourceFinanceAccount'
  | 'destinationFinanceAccount'
  | 'details'
  | 'listKey'
  | 'statusHelper'
> {
  createDate: string;
  issueDate: string;
  notes: string | null;

  // Map
  sourceFinanceAccount: FinanceAccountLite | null;
  destinationFinanceAccount: FinanceAccountLite | null;
  details: TransactionDetailVm[];

  // Functional
  listKey: string | null;
}

export interface TransactionDetailVm extends Omit<TransactionDetail, 'quantity' | 'unitPrice'> {
  quantity: number | string;
  unitPrice: number | string;

  // Frontend Customizations
  key?: string; // Used for list editing
}

// API Models

export interface TransactionAm extends Omit<
  DocApiModel<Transaction>,
  | 'createDate'
  | 'issueDate'
  | 'notes'
  | 'sourceFinanceAccount'
  | 'destinationFinanceAccount'
  | 'details'
  | 'listKey'
  | 'statusHelper'
> {
  createDate: Timestamp;
  issueDate: Timestamp;
  notes?: string | null;

  // Map
  sourceFinanceAccount?: FinanceAccountLite | null;
  destinationFinanceAccount?: FinanceAccountLite | null;
  details: TransactionDetailAm[];

  // Functional
  listKey?: string | null;
}

export type TransactionDetailAm = TransactionDetail;
