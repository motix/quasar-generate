import type { DocApiModel, DocModel } from 'models/firebase-firestore/index.js';

// Models

export interface Member extends DocModel {
  uid: string;
  isActive: boolean;
  email: string;
  fullName: string;
  photoUrl: string;
}

export interface MemberLite {
  id: string;
  fullName: string;
}

// API Models

export type MemberAm = DocApiModel<Member>;
