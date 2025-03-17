import type { UserRecord } from 'firebase-admin/auth';
import { getAuth } from 'firebase-admin/auth';

export default async function listAllUsers(buffer: UserRecord[], pageToken?: string) {
  const result = await getAuth().listUsers(1000, pageToken);
  buffer.push(...result.users);

  if (result.pageToken) {
    await listAllUsers(buffer, result.pageToken);
  }
}
