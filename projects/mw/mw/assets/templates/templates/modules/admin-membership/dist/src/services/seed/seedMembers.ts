import { useMembersStore } from 'stores/membership/Members.js';

export function seedMembers() {
  const store = useMembersStore();

  for (let i = 0; i < 10; i++) {
    void store.createDoc({
      doc: {
        uid: `UID_${i}`,
        isActive: i > 4,
        email: `email_${i}@motiteam.com`,
        fullName: `Full Name ${i}`,
        photoUrl:
          'https://lh3.googleusercontent.com/a-/AOh14GgtXlNBjgr5K_ACqE6_YzAqeleT0TPKR92uJohb=s96-c',
        slackId: null,
        inviteToFinanceChannels: false,
      },
    });
  }

  store.recentlyAddedDocs = [];
}
