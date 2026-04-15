import { info } from 'firebase-functions/logger';

import { extraLog } from 'utils/conditionalLog.js';
import generateCodeMethod from 'utils/generateCode.js';
import onCallWithPermission from 'utils/onCallWithPermission.js';

export const generateCode = onCallWithPermission<
  { prefix: string; parts: string[] },
  Promise<string>
>([], async ({ data: { prefix, parts } }) => {
  const code = await generateCodeMethod(prefix, ...parts);

  await extraLog(info, '[global-generateCode]', `Code generated as "${code}".`);

  return code;
});
