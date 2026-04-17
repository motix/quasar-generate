import type { Timestamp } from 'firebase/firestore';

import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface FinanceAccount extends DocModel {
  isActive: boolean;
  name: string;
  description?: string;

  // Map
  balanceRecords: BalanceRecord[];
}

export interface BalanceRecord {
  date: Date;
  balance: number;
}

export interface FinanceAccountLite {
  id: string;
  name: string;
}

// View Models

export interface FinanceAccountVm extends Omit<
  DocViewModel<FinanceAccount>,
  'description' | 'balanceRecords'
> {
  description: string | null;

  // Map
  balanceRecords: BalanceRecordVm[];
}

export interface BalanceRecordVm extends Omit<BalanceRecord, 'date'> {
  date: string;
}

// API Models

export interface FinanceAccountAm extends Omit<
  DocApiModel<FinanceAccount>,
  'description' | 'balanceRecords'
> {
  description?: string | null;

  // Map
  balanceRecords: BalanceRecordAm[];
}

export interface BalanceRecordAm extends Omit<BalanceRecord, 'date'> {
  date: Timestamp;
}
