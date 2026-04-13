import type { Timestamp } from 'firebase/firestore';

import type {
  CustomerLite,
  Transaction,
  TransactionAm,
  TransactionVm,
} from 'models/finance/index.js';
import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InvoiceExtendedFields {} // To be augmented

export interface Invoice extends DocModel {
  isArchived: boolean;
  code: string;
  createDate: Date;
  issueDate: Date;
  isRequired: boolean;
  isCompleted: boolean;
  isApproved: boolean;
  isRejected: boolean;
  isSentToCustomer: boolean;
  isCancelled: boolean;
  isCapitalContribution: boolean;
  isExternal: boolean;
  customerExtraInfo?: string;
  referenceNumber?: string;
  content: string;
  discount?: number;
  contractSubtotal?: number;
  vatPercent?: number;
  vatableAmount?: number;
  secondVatPercent?: number;
  secondVatableAmount?: number;
  vatAdjustment?: number;
  relocatedSubtotal?: number;
  relocatedVat?: number;
  notes?: string;

  // Map
  customer: CustomerLite;
  details: InvoiceDetail[];
  transactions: Transaction[];

  // Functional
  listKey?: string;
}

export interface InvoiceDetail {
  content: string;
  quantity: number;
  unitPrice: number;
}

// View Models

export interface InvoiceVm extends Omit<
  DocViewModel<Invoice>,
  | 'createDate'
  | 'issueDate'
  | 'customerExtraInfo'
  | 'referenceNumber'
  | 'discount'
  | 'contractSubtotal'
  | 'vatPercent'
  | 'vatableAmount'
  | 'secondVatPercent'
  | 'secondVatableAmount'
  | 'vatAdjustment'
  | 'relocatedSubtotal'
  | 'relocatedVat'
  | 'notes'
  | 'customer'
  | 'details'
  | 'transactions'
  | 'listKey'
  | 'statusHelper'
  // In the extension eslint won't report this error because `InvoiceExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof InvoiceExtendedFields
> {
  createDate: string;
  issueDate: string;
  customerExtraInfo: string | null;
  referenceNumber: string | null;
  discount: number | string | null;
  contractSubtotal: number | string | null;
  vatPercent: number | string | null;
  vatableAmount: number | string | null;
  secondVatPercent: number | string | null;
  secondVatableAmount: number | string | null;
  vatAdjustment: number | string | null;
  relocatedSubtotal: number | string | null;
  relocatedVat: number | string | null;
  notes: string | null;

  // Map
  customer?: CustomerLite;
  details: InvoiceDetailVm[];
  transactions: TransactionVm[];

  // Functional
  listKey: string | null;
}

export interface InvoiceDetailVm extends Omit<InvoiceDetail, 'quantity' | 'unitPrice'> {
  quantity: number | string;
  unitPrice: number | string;

  // Frontend Customizations
  key?: string; // Used for list editing
}

// API Models

export interface InvoiceAm extends Omit<
  DocApiModel<Invoice>,
  | 'createDate'
  | 'issueDate'
  | 'customerExtraInfo'
  | 'referenceNumber'
  | 'discount'
  | 'contractSubtotal'
  | 'vatPercent'
  | 'vatableAmount'
  | 'secondVatPercent'
  | 'secondVatableAmount'
  | 'vatAdjustment'
  | 'relocatedSubtotal'
  | 'relocatedVat'
  | 'notes'
  | 'details'
  | 'transactions'
  | 'listKey'
  | 'statusHelper'
  // In the extension eslint won't report this error because `InvoiceExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof InvoiceExtendedFields
> {
  createDate: Timestamp;
  issueDate: Timestamp;
  customerExtraInfo?: string | null;
  referenceNumber?: string | null;
  discount?: number | null;
  contractSubtotal?: number | null;
  vatPercent?: number | null;
  vatableAmount?: number | null;
  secondVatPercent?: number | null;
  secondVatableAmount?: number | null;
  vatAdjustment?: number | null;
  relocatedSubtotal?: number | null;
  relocatedVat?: number | null;
  notes?: string | null;

  // Map
  details: InvoiceDetailAm[];
  transactions: TransactionAm[];

  // Functional
  listKey?: string | null;
}

export type InvoiceDetailAm = InvoiceDetail;
