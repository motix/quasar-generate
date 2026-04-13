import type { UserRole } from 'models/firebase-auth/index.js';
import type { DocApiModel, DocModel, DocViewModel } from 'models/firebase-firestore/index.js';

// Models

export interface UserAccount extends DocModel {
  uid: string;
  email?: string;
  displayName?: string;
  photoUrl?: string;
  claims: UserRole[];
}

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

export type UserAccountAm = DocApiModel<UserAccount>;

export interface MemberAm extends Omit<DocApiModel<Member>, 'slackId'> {
  slackId?: string | null;
}
