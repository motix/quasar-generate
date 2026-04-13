import type { Timestamp } from 'firebase/firestore';

// Models

declare module 'models/finance/projects.js' {
  interface ProjectExtendedFields {
    quotations: never;
  }

  interface Project {
    // Map
    quotations: Quotation[];
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface QuotationExtendedFields {} // To be augmented

export interface Quotation {
  code: string;
  createDate: Date;
  isApproved: boolean;
  isSentToCustomer: boolean;
  isConfirmed: boolean;
  isCancelled: boolean;
  isRevised: boolean;
  discount?: number;
  vatPercent?: number;
  vatableAmount?: number;

  // Map
  details: QuotationDetail[];

  // Functional
  listKey?: string;
}

export interface QuotationDetail {
  isProductionOnly: boolean;
  isQuotationOnly: boolean;
  content: string;
  quantity: number;
  productionSalaryUnitPrice?: number;
  unitPrice?: number;
}

// View Models

declare module 'models/finance/projects.js' {
  interface ProjectVm {
    // Map
    quotations: QuotationVm[];
  }
}

export interface QuotationVm extends Omit<
  Quotation,
  | 'createDate'
  | 'discount'
  | 'vatPercent'
  | 'vatableAmount'
  | 'details'
  | 'listKey'
  | 'statusHelper'
  // In the extension eslint won't report this error because `QuotationExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof QuotationExtendedFields
> {
  createDate: string;
  discount: number | string | null;
  vatPercent: number | string | null;
  vatableAmount: number | string | null;

  // Map
  details: QuotationDetailVm[];

  // Functional
  listKey: string | null;
}

export interface QuotationDetailVm extends Omit<
  QuotationDetail,
  'quantity' | 'productionSalaryUnitPrice' | 'unitPrice'
> {
  quantity: number | string;
  productionSalaryUnitPrice: number | string;
  unitPrice: number | string;
}

// API Models

declare module 'models/finance/projects.js' {
  interface ProjectAm {
    // Map
    quotations: QuotationAm[];
  }
}

export interface QuotationAm extends Omit<
  Quotation,
  | 'createDate'
  | 'discount'
  | 'vatPercent'
  | 'vatableAmount'
  | 'details'
  | 'listKey'
  | 'statusHelper'
  // In the extension eslint won't report this error because `QuotationExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof QuotationExtendedFields
> {
  createDate: Timestamp;
  discount?: number | null;
  vatPercent?: number | null;
  vatableAmount?: number | null;

  // Map
  details: QuotationDetailAm[];

  // Functional
  listKey?: string | null;
}

export interface QuotationDetailAm extends Omit<
  QuotationDetail,
  'productionSalaryUnitPrice' | 'unitPrice'
> {
  productionSalaryUnitPrice?: number | null;
  unitPrice?: number | null;
}
