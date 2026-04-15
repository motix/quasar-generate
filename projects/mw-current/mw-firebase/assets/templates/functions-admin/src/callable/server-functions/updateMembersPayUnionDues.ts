// Already done. Do not run again.

import { info } from 'firebase-functions/logger';

import { collectionForeach } from 'utils/queryForeach.js';

import type { MemberAm as Member } from 'models/hr/team.js';

export default async function updateMembersPayUnionDues() {
  await collectionForeach<Member, Member>('hr_members', async (docSnapshot) => {
    const member = docSnapshot.data();
    const payUnionDues =
      member.isIncludedInPayroll &&
      member.fullName !== 'Nguyễn Ngọc Minh' &&
      member.fullName !== 'Trần Tuấn Tú' &&
      (member.socialInsuranceSalary || 0) > 0;
    info(
      '[updateMembersPayUnionDues]',
      `Updating member "${docSnapshot.data().fullName}" (Pay Union Dues: ${payUnionDues ? 'Yes' : 'No'})...`,
    );

    await docSnapshot.ref.update({
      payUnionDues,
    });
  });
}
