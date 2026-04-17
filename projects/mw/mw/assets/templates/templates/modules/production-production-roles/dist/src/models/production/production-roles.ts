import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface ProductionRole extends DocModel {
  isActive: boolean;
  name: string;
  position: number;
}

export interface ProductionRoleLite {
  id: string;
  name: string;
}

export interface ProductionRoleSortableLite {
  id: string;
  name: string;
  position: number;
}

// View Models

export interface ProductionRoleVm extends Omit<DocViewModel<ProductionRole>, 'position'> {
  position: number | string;
}

// API Models

export type ProductionRoleAm = DocApiModel<ProductionRole>;
