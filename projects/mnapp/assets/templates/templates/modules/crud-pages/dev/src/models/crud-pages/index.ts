import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface Member extends DocModel {
  uid: string;
  isActive: boolean;
  email: string;
  fullName: string;
  photoUrl: string;
  slackId?: string;
  inviteToFinanceChannels: boolean;
}

// View Models

export interface MemberVm extends Omit<DocViewModel<Member>, 'slackId'> {
  slackId: string | null;
}

// API Models

export interface MemberAm extends Omit<DocApiModel<Member>, 'slackId'> {
  slackId?: string | null;
}
