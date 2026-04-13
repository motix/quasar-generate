import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface Supplier extends DocModel {
  isActive: boolean;
  code: string;
  name: string;
}

export interface SupplierLite {
  id: string;
  code: string;
  name: string;
}

// View Models

export type SupplierVm = DocViewModel<Supplier>;

// API Models

export type SupplierAm = DocApiModel<Supplier>;
