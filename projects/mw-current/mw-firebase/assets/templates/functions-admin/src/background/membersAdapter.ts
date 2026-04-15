import type { DocumentSnapshot } from 'firebase-admin/firestore';
import type { Change } from 'firebase-functions/v2';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import adapterUpdate from 'utils/adapterUpdate.js';

import type { MemberAm as FinanceMember } from 'models/finance/index.js';
import type { MemberAm as HrMember } from 'models/hr/index.js';
import type { MemberAm as AdminMember } from 'models/membership/index.js';
import type { MemberAm as ProductionMember } from 'models/production/index.js';

export const membersAdapter = onDocumentWritten('admin_members/{id}', async (event) => {
  if (!event.data) {
    return;
  }

  const memberChange = event.data as Change<DocumentSnapshot<AdminMember>>;
  const id = event.params.id;

  // Admin to HR

  await adapterUpdate<AdminMember, HrMember, never>(
    memberChange.after,
    id,
    'hr_members',
    (source) =>
      Promise.resolve({
        isActive: source.isActive,
        email: source.email,
        fullName: source.fullName,
        photoUrl: source.photoUrl,
      }),
    (intersection) => ({
      ...intersection,
      isIncludedInPayroll: true,
      payUnionDues: false,
    }),
    'fullName',
  );

  // Admin to Production

  await adapterUpdate<AdminMember, ProductionMember, never>(
    memberChange.after,
    id,
    'production_members',
    (source) =>
      Promise.resolve({
        uid: source.uid,
        isActive: source.isActive,
        email: source.email,
        fullName: source.fullName,
        photoUrl: source.photoUrl,
      }),
    (intersection) => intersection,
    'fullName',
  );

  // Admin to Finance

  await adapterUpdate<AdminMember, FinanceMember, never>(
    memberChange.after,
    id,
    'finance_members',
    (source) =>
      Promise.resolve({
        uid: source.uid,
        isActive: source.isActive,
        email: source.email,
        fullName: source.fullName,
        photoUrl: source.photoUrl,
      }),
    (intersection) => intersection,
    'fullName',
  );
});
