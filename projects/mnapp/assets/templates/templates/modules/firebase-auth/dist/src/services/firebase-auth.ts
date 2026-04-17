import type { Router } from 'vue-router';

import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';

import type { UserClaims } from 'models/firebase-auth/index.js';
import { userRoles } from 'models/firebase-auth/index.js';

import { useFirebaseAuthStore } from 'stores/FirebaseAuth.js';

import { getAuth, getFunctions } from 'services/firebase.js';

function waitForUserClaims() {
  const store = useFirebaseAuthStore();

  if (store.currentUserClaims) {
    return new Promise<void>((resolve) => resolve());
  }

  return new Promise<void>((resolve) => {
    setTimeout(() => {
      waitForUserClaims()
        .then(() => resolve())
        .catch(() => undefined);
    }, 100);
  });
}

export function ensureAuthInitialized() {
  const store = useFirebaseAuthStore();

  if (store.isAuthInitialized) {
    if (store.currentUser) {
      // For newly signed up users, wait for getIdTokenResult and getIdToken to resolve
      // and set claims to store. Otherwise, routes that require checking roles will always deny access.
      return waitForUserClaims();
    }

    return new Promise<void>((resolve) => resolve());
  }

  // Create the observer only once on init
  return new Promise<void>((resolve, reject) => {
    // Use a promise to make sure that the router will eventually show the route after the auth is initialized.
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          // For already signed in users from last session, wait for getIdTokenResult to resolve
          // and set claims to store. Otherwise, routes that require checking roles will always deny access.
          waitForUserClaims()
            .then(() => {
              store.isAuthInitialized = true;
              resolve();
              unsubscribe();
            })
            .catch(() => undefined);
        } else {
          store.isAuthInitialized = true;
          resolve();
          unsubscribe();
        }
      },
      (error) => {
        reject(error);
        unsubscribe();
      },
    );
  });
}

export function isAuthenticated() {
  const store = useFirebaseAuthStore();

  return store.isAuthenticated;
}

let handleAuthStateChangedCount = 0;

export function handleAuthStateChanged(user: User | null, router: Router, firstCall: boolean) {
  if (firstCall) {
    handleAuthStateChangedCount = 0;
  } else {
    handleAuthStateChangedCount++;
  }

  const store = useFirebaseAuthStore();

  store.currentUser = user;
  store.currentUserClaims = null;

  if (user) {
    // Signed in
    user
      .getIdTokenResult()
      .then((idTokenResult) => {
        if (idTokenResult.claims.admin === undefined) {
          if (handleAuthStateChangedCount > 1000) {
            console.error('Firebase background function processSignUp not deployed');
            store.currentUserClaims = {};
          } else {
            // For newly signed up users, server will assign claims but they are not returned together with
            // the token immediately. Force refresh the toke to get new claims.
            user
              .getIdToken(true)
              .then(() => handleAuthStateChanged(user, router, false))
              .catch((error) => {
                throw new Error('[mnapp-firebase-auth] getIdToken failed.', { cause: error });
              });
          }
        } else {
          const claims: UserClaims = {};

          for (const role of userRoles) {
            claims[role] = !!idTokenResult.claims[role];
          }

          store.currentUserClaims = claims;
        }
      })
      .catch((error) => {
        throw new Error('[mnapp-firebase-auth] getIdTokenResult failed.', { cause: error });
      });
  } else {
    // Signed out
    if (router.currentRoute.value.meta.requiresAuth) {
      void router.push({ name: 'SignedOut' });
    }
  }
}

export function signOut() {
  const auth = getAuth();
  return auth.signOut();
}

export async function createRemoteSignInToken() {
  const functions = getFunctions();
  const createAuthToken = httpsCallable<undefined, string>(functions, 'auth-createAuthToken');

  try {
    const result = await createAuthToken();
    return result.data;
  } catch (error) {
    throw new Error('[mnapp-firebase-auth] Calling to auth-createAuthToken failed.', {
      cause: error,
    });
  }
}
