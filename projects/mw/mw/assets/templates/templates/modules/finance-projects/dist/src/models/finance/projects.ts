import type { Timestamp } from 'firebase/firestore';

import type { CustomerLite } from 'models/finance/index.js';
import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProjectExtendedFields {} // To be augmented

export interface Project extends DocModel {
  isArchived: boolean;
  name: string;
  urlFriendlyName: string;
  customerContact: string;
  owner: string;
  finishDate: Date;
  isInvoiceRequired: boolean;
  discount?: number;
  vatPercent?: number;
  vatableAmount?: number;

  // Map
  customer: CustomerLite;
  items: Item[];

  // Functional
  supplierIds: string[];
}

export interface Item {
  isProductionOnly: boolean;
  isFinanceOnly: boolean;
  isQuotationOnly: boolean;
  title: string;
  number?: string;
  description?: string;
  productType?: string;
  quantity: number;
  productionSalaryUnitPrice?: number;
  unitPrice?: number;
}

// View Models

export interface ProjectVm extends Omit<
  DocViewModel<Project>,
  | 'finishDate'
  | 'discount'
  | 'vatPercent'
  | 'vatableAmount'
  | 'items'
  | 'statusHelper'
  // In the extension eslint won't report this error because `ProjectExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof ProjectExtendedFields
> {
  finishDate: string;
  discount: number | string | null;
  vatPercent: number | string | null;
  vatableAmount: number | string | null;

  // Map
  items: ItemVm[];
}

export interface ItemVm extends Omit<
  Item,
  'number' | 'description' | 'productType' | 'quantity' | 'productionSalaryUnitPrice' | 'unitPrice'
> {
  number: string | null;
  description: string | null;
  productType: string | null;
  quantity: number | string;
  productionSalaryUnitPrice: number | string | null;
  unitPrice: number | string | null;

  // Frontend Customizations
  key?: string; // Used for list editing
}

// API Models

export interface ProjectAm extends Omit<
  DocApiModel<Project>,
  | 'finishDate'
  | 'discount'
  | 'vatPercent'
  | 'vatableAmount'
  | 'items'
  | 'statusHelper'
  // In the extension eslint won't report this error because `ProjectExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof ProjectExtendedFields
> {
  finishDate: Timestamp;
  discount?: number | null;
  vatPercent?: number | null;
  vatableAmount?: number | null;

  // Map
  items: ItemAm[];
}

export interface ItemAm extends Omit<
  Item,
  'number' | 'description' | 'productType' | 'productionSalaryUnitPrice' | 'unitPrice'
> {
  number?: string | null;
  description?: string | null;
  productType?: string | null;
  productionSalaryUnitPrice?: number | null;
  unitPrice?: number | null;
}
