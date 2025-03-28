/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-empty-object-type */

// Signatures coppied from https://github.com/firebase/firebase-functions/blob/master/src/v2/providers/https.ts.
// Adding AuthenticatedCallableRequest becasue `request.auth` is always available when passing to `handler`.

import type { ManagedRolesToken } from 'firebase-admin/auth';
import type {
  CallableFunction,
  CallableOptions,
  CallableRequest,
  CallableResponse,
} from 'firebase-functions/v2/https';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

declare module 'firebase-admin/auth' {
  // Augment this interface to define roles
  export interface ManagedRolesToken {
    admin: boolean;
  }

  interface DecodedIdToken extends ManagedRolesToken {}
}

type AuthenticatedCallableRequest<T = any> = Omit<CallableRequest<T>, 'auth'> &
  Required<Pick<CallableRequest<T>, 'auth'>>;

/**
 * Declares a callable method for clients to call using a Firebase SDK.
 * @param roles - Expected roles to execute the function.
 * @param opts - Options to set on this function.
 * @param handler - A function that takes a {@link https.CallableRequest}.
 * @returns A function that you can export and deploy.
 */
export function onCallWithPermission<T = any, Return = any | Promise<any>, Stream = unknown>(
  roles: (keyof ManagedRolesToken)[],
  opts: CallableOptions<T>,
  handler: (
    request: AuthenticatedCallableRequest<T>,
    response?: CallableResponse<Stream>,
  ) => Return,
): CallableFunction<T, Return extends Promise<unknown> ? Return : Promise<Return>, Stream>;

/**
 * Declares a callable method for clients to call using a Firebase SDK.
 * @param roles - Expected roles to execute the function.
 * @param handler - A function that takes a {@link https.CallableRequest}.
 * @returns A function that you can export and deploy.
 */
export function onCallWithPermission<T = any, Return = any | Promise<any>, Stream = unknown>(
  roles: (keyof ManagedRolesToken)[],
  handler: (
    request: AuthenticatedCallableRequest<T>,
    response?: CallableResponse<Stream>,
  ) => Return,
): CallableFunction<T, Return extends Promise<unknown> ? Return : Promise<Return>>;
export default function onCallWithPermission<
  T = any,
  Return = any | Promise<any>,
  Stream = unknown,
>(
  roles: (keyof ManagedRolesToken)[],
  optsOrHandler: CallableOptions<T> | ((request: AuthenticatedCallableRequest<T>) => Return),
  handler?: (
    request: AuthenticatedCallableRequest<T>,
    response?: CallableResponse<Stream>,
  ) => Return,
): CallableFunction<T, Return extends Promise<unknown> ? Return : Promise<Return>> {
  if (arguments.length === 2) {
    return onCall<T, Return, Stream>((request, response) => {
      if (
        !request.auth ||
        (roles.length > 0 && roles.every((role) => !request.auth?.token?.[role]))
      ) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      return (optsOrHandler as NonNullable<typeof handler>)(
        request as AuthenticatedCallableRequest<T>,
        response,
      );
    });
  } else {
    return onCall<T, Return, Stream>(optsOrHandler as CallableOptions<T>, (request, response) => {
      if (
        !request.auth ||
        (roles.length > 0 && roles.every((role) => !request.auth?.token?.[role]))
      ) {
        throw new HttpsError('permission-denied', 'Unauthorized function call.');
      }

      return handler!(request as AuthenticatedCallableRequest<T>, response);
    });
  }
}
