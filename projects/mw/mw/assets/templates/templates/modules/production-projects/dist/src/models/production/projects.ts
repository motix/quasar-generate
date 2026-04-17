import type { Timestamp } from 'firebase/firestore';

import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';
import type {
  CustomerLite,
  MemberLite,
  ProductionRoleLite,
  ProductTypeLite,
} from 'models/production/index.js';

// Models

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ProjectExtendedFields {} // To be augmented

export interface Project extends DocModel {
  isPrivate: boolean;
  isArchived: boolean;
  name: string;
  urlFriendlyName: string;
  customerContact: string;
  startDate: Date;
  finishDate: Date;
  description?: string;

  // Map
  owner: MemberLite;
  customer: CustomerLite;
  items: Item[];
}

export interface Item {
  title: string;
  number?: string;
  description?: string;
  quantity: number;

  // Map
  productType: ProductTypeLite;
  contributions: ItemContribution[];
}

export interface ItemContribution {
  productionSalaryBase: number;
  involvement: number;
  priceFactor: number;

  // Map
  member: MemberLite;
  productionRole: ProductionRoleLite;
}

// View Models

export interface ProjectVm extends Omit<
  DocViewModel<Project>,
  | 'startDate'
  | 'finishDate'
  | 'description'
  | 'owner'
  | 'customer'
  | 'items'
  // In the extension eslint won't report this error because `ProjectExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof ProjectExtendedFields
> {
  startDate: string;
  finishDate: string;
  description: string | null;

  // Map
  owner?: MemberLite;
  customer?: CustomerLite;
  items: ItemVm[];
}

export interface ItemVm extends Omit<
  Item,
  'number' | 'description' | 'quantity' | 'productType' | 'contributions'
> {
  number: string | null;
  description: string | null;
  quantity: number | string;

  // Map
  productType?: ProductTypeLite;
  contributions: ItemContributionVm[];

  // Frontend Customizations
  key?: string; // Used for list editing
}

export interface ItemContributionVm extends Omit<
  ItemContribution,
  'productionSalaryBase' | 'involvement' | 'priceFactor' | 'member' | 'productionRole'
> {
  productionSalaryBase: number | string;
  involvement: number | string;
  priceFactor: number | string;

  // Map
  member?: MemberLite;
  productionRole?: ProductionRoleLite | undefined; // Allow undefined while editing

  // Frontend Customizations
  key?: string; // Used for list editing
}

// API Models

export interface ProjectAm extends Omit<
  DocApiModel<Project>,
  | 'startDate'
  | 'finishDate'
  | 'description'
  | 'items'
  // In the extension eslint won't report this error because `ProjectExtendedFields` was augmented.
  // In the host app, if no module augments this interface, turn on the directive manually after invoking the extension.
  /// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  | keyof ProjectExtendedFields
> {
  startDate: Timestamp;
  finishDate: Timestamp;
  description?: string | null;

  // Map
  items: ItemAm[];
}

export interface ItemAm extends Omit<Item, 'number' | 'description' | 'contributions'> {
  number?: string | null;
  description?: string | null;

  // Map
  contributions: ItemContributionAm[];
}

export type ItemContributionAm = ItemContribution;
