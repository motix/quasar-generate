/* eslint-disable @typescript-eslint/no-explicit-any */
import checkFunctionFlag from './checkFunctionFlag.js';

export async function debugLog(writeLog: (...args: any[]) => void, ...args: any[]) {
  if (await checkFunctionFlag('conditionalLog-debug')) {
    writeLog('[DEBUG]', ...args);
  }
}

export async function extraLog(writeLog: (...args: any[]) => void, ...args: any[]) {
  if (await checkFunctionFlag('conditionalLog-extra')) {
    writeLog('[EXTRA]', ...args);
  }
}
