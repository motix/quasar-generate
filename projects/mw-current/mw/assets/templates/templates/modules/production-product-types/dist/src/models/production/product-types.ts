import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';
import type { ProductionRoleSortableLite } from 'models/production/index.js';

// Models

export interface ProductType<
  TProductionSalaryDetail extends ProductionSalaryDetail | ProductionSalaryDetailVm,
> extends DocModel {
  isActive: boolean;
  name: string;
  position: number;

  // Sub-collection
  productionSalaryDetails?: TProductionSalaryDetail[];
}

export interface ProductTypeLite {
  id: string;
  name: string;
}

export interface ProductionSalaryDetail {
  productionSalary: number;

  // Map
  productionRole: ProductionRoleSortableLite;
}

// View Models

export interface ProductTypeVm extends Omit<
  DocViewModel<ProductType<never>>,
  'position' | 'productionSalaryDetails'
> {
  position: number | string;
}

export interface ProductionSalaryDetailVm extends Omit<ProductionSalaryDetail, 'productionSalary'> {
  productionSalary: number | string | null;
}

// API Models

export type ProductTypeAm = Omit<DocApiModel<ProductType<never>>, 'productionSalaryDetails'>;

export type ProductionSalaryDetailAm = ProductionSalaryDetail;
