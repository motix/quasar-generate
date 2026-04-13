import type { DocApiModel, DocModel } from 'models/firebase-firestore/index.js';

// Models

export interface Customer extends DocModel {
  isActive: boolean;
  code: string;
  name: string;
}

export interface CustomerLite {
  id: string;
  code: string;
  name: string;
}

// API Models

export type CustomerAm = DocApiModel<Customer>;
