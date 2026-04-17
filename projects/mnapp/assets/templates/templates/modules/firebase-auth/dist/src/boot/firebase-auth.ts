import { defineBoot } from '#q-app/wrappers';

import { onAuthStateChanged } from 'firebase/auth';

import { adminRole, userRole } from 'models/firebase-auth/index.js';

import { useFirebaseAuthStore } from 'stores/FirebaseAuth.js';

import {
  ensureAuthInitialized,
  handleAuthStateChanged,
  isAuthenticated,
} from 'services/firebase-auth.js';
import { getAuth } from 'services/firebase.js';

import useNotifications from 'composables/useNotifications.js';

export default defineBoot(({ router }) => {
  // Router

  router.addRoute('MainLayout', {
    name: 'SignIn',
    path: '/auth/sign-in/:returnUrl?',
    component: () => import('pages/auth/SignIn.vue'),
    meta: { anonymous: true },
  });

  router.addRoute('MainLayout', {
    name: 'TermsOfService',
    path: '/auth/terms-of-service',
    component: () => import('pages/auth/TermsOfService.vue'),
    meta: { anonymous: true },
  });

  router.addRoute('MainLayout', {
    name: 'PrivacyPolicy',
    path: '/auth/privacy-policy',
    component: () => import('pages/auth/PrivacyPolicy.vue'),
    meta: { anonymous: true },
  });

  router.addRoute('MainLayout', {
    name: 'UnauthorizedAccess',
    path: '/auth/unauthorized',
    component: () => import('pages/auth/UnauthorizedAccess.vue'),
    meta: { anonymous: true },
  });

  router.addRoute('MainLayout', {
    name: 'SignedOut',
    path: '/auth/signed-out',
    component: () => import('pages/auth/SignedOut.vue'),
    meta: { anonymous: true },
  });

  router.addRoute('MainLayout', {
    name: 'RemoteSignIn',
    path: '/auth/remote-sign-in/:key',
    component: () => import('pages/auth/RemoteSignIn.vue'),
    meta: { anonymous: true },
  });

  router.beforeEach(async (to) => {
    const store = useFirebaseAuthStore();

    // Force the app to wait until Firebase has finished its initialization
    await ensureAuthInitialized();

    if (to.name === 'SignIn' && isAuthenticated()) {
      // Handle `signInWithRedirect` redirected back to sign in page
      return (to.params.returnUrl as string | undefined)?.slice(3) || '/'; // Remove '?r=' from returnUrl
    } else if (to.meta.anonymous === true) {
      return;
    } else if (to.matched.some((record) => record.meta.requiresAuth === true)) {
      if (isAuthenticated()) {
        const roles = store.currentUserRoles;

        if (!roles.includes(adminRole)) {
          for (const record of to.matched) {
            if (record.meta.roles && record.meta.roles.length > 0) {
              if (
                !roles.includes(userRole) ||
                !record.meta.roles.some((role) => roles.includes(role))
              ) {
                return { name: 'UnauthorizedAccess' };
              }
            }
          }
        }

        return;
      } else {
        // Encoded URL string placed right after '/' will be decoded by Google provider
        // when returning to SignIn page after authenticating.
        // Place it in a query string like param instead.
        const returnUrl = to.fullPath === '/' ? '' : `?r=${to.fullPath}`;
        return { name: 'SignIn', params: { returnUrl } };
      }
    }

    return;
  });

  // Firebase Authentication

  const auth = getAuth();

  onAuthStateChanged(
    auth,
    (user) => handleAuthStateChanged(user, router, true),
    (error) => {
      const { notifyErrorDebug } = useNotifications();

      console.error(error);
      notifyErrorDebug(error);
    },
  );
});
