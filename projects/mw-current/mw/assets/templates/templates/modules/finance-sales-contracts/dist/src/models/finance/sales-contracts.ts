import type { Timestamp } from 'firebase/firestore';

import type { CustomerLite, Invoice, Project } from 'models/finance/index.js';
import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface SalesContract extends DocModel {
  isArchived: boolean;
  code: string;
  urlFriendlyCode: string;
  signDate: Date;
  isCancelled: boolean;
  content: string;
  subTotal: number;
  arising?: number;
  vatPercent?: number;
  secondVatPercent?: number;
  secondVatableAmount?: number;
  vatAdjustment?: number;
  notes?: string;
  unavailableProjectIds: string[];
  unavailableGeneralInvoiceIds: string[];

  // Map
  customer: CustomerLite;
  projects: Project[];
  generalInvoices: Invoice[];
  vatInvoices: VatInvoice[];

  // Functional
  firstVatInvoiceIssueDate?: Date;
  vatInvoiceIssueDateLength?: number;
}

export interface VatInvoice {
  code: string;
  issueDate: Date;
  isCancelled: boolean;
  content: string;
  subTotal: number;
  vatPercent?: number;
  vatAdjustment?: number;
}

// View Models

export interface SalesContractVm extends Omit<
  DocViewModel<SalesContract>,
  | 'signDate'
  | 'subTotal'
  | 'arising'
  | 'vatPercent'
  | 'secondVatPercent'
  | 'secondVatableAmount'
  | 'vatAdjustment'
  | 'notes'
  | 'unavailableProjectIds'
  | 'unavailableGeneralInvoiceIds'
  | 'customer'
  | 'projects'
  | 'generalInvoices'
  | 'vatInvoices'
  | 'firstVatInvoiceIssueDate'
  | 'vatInvoiceIssueDateLength'
  | 'statusHelper'
> {
  signDate: string;
  subTotal: number | string;
  arising: number | string | null;
  vatPercent: number | string | null;
  secondVatPercent: number | string | null;
  secondVatableAmount: number | string | null;
  vatAdjustment: number | string | null;
  notes: string | null;

  // Map
  customer?: CustomerLite;
  projects: Project[];
  generalInvoices: Invoice[];
  vatInvoices: VatInvoiceVm[];

  // Functional
  firstVatInvoiceIssueDate: string | null;
  vatInvoiceIssueDateLength: number | string | null;
}

export interface VatInvoiceVm extends Omit<
  VatInvoice,
  'issueDate' | 'subTotal' | 'vatPercent' | 'vatAdjustment'
> {
  issueDate: string;
  subTotal: number | string;
  vatPercent: number | string | null;
  vatAdjustment: number | string | null;

  // Frontend Customizations
  key?: string; // Used for list editing
}

// API Models

export interface SalesContractAm extends Omit<
  DocApiModel<SalesContract>,
  | 'signDate'
  | 'arising'
  | 'vatPercent'
  | 'secondVatPercent'
  | 'secondVatableAmount'
  | 'vatAdjustment'
  | 'notes'
  | 'unavailableProjectIds'
  | 'unavailableGeneralInvoiceIds'
  | 'projects'
  | 'generalInvoices'
  | 'vatInvoices'
  | 'firstVatInvoiceIssueDate'
  | 'vatInvoiceIssueDateLength'
  | 'statusHelper'
> {
  signDate: Timestamp;
  arising?: number | null;
  vatPercent?: number | null;
  secondVatPercent?: number | null;
  secondVatableAmount?: number | null;
  vatAdjustment?: number | null;
  notes?: string | null;

  // Map
  projectIds: string[];
  generalInvoiceIds: string[];
  vatInvoices: VatInvoiceAm[];

  // Functional
  firstVatInvoiceIssueDate: Timestamp | null;
  vatInvoiceIssueDateLength: number | null;
  loadedProjects: Project[];
  loadedGeneralInvoices: Invoice[];
}

export interface VatInvoiceAm extends Omit<
  VatInvoice,
  'issueDate' | 'vatPercent' | 'vatAdjustment'
> {
  issueDate: Timestamp;
  vatPercent?: number | null;
  vatAdjustment?: number | null;
}
