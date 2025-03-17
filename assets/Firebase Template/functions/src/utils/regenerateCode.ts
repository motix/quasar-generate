import generateCode from './generateCode.js';

export default async function regenerateCode(oldCode: string, ...parts: string[]) {
  return generateCode(oldCode.substring(0, oldCode.indexOf('-') + 1), ...parts);
}
