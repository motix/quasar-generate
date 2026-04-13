import type { DocApiModel, DocModel } from 'models/firebase-firestore/index.js';
import type { ProductionRoleLite } from 'models/production/index.js';

// Models

export interface Member extends DocModel {
  uid: string;
  isActive: boolean;
  email: string;
  fullName: string;
  photoUrl: string;

  // Map
  defaultProductionRole?: ProductionRoleLite;
}

export interface MemberLite {
  id: string;
  fullName: string;
}

// API Models

export interface MemberAm extends Omit<DocApiModel<Member>, 'defaultProductionRole'> {
  // Map
  defaultProductionRole?: ProductionRoleLite | null;
}
