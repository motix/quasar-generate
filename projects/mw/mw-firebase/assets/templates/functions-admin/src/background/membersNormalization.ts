import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import docNormalization from 'utils/docNormalization.js';

import type { MemberAm as Member } from 'models/membership/index.js';

export const membersNormalization = onDocumentWritten(
  'admin_members/{id}',
  (event) =>
    !!event.data &&
    docNormalization<Member>(event.data.before, event.data.after, 'fullName', 'uid', 'email'),
);
