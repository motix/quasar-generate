import onCallWithPermission from 'utils/onCallWithPermission.js';

export const runServerFunction = onCallWithPermission<never, Promise<string>>(
  ['admin'],
  async () => {
    // Run functions that should be executed only on the server side here.

    return Promise.resolve(`'runServerFunction' done at ${new Date().toLocaleString()}.`);
  },
);
