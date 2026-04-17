import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { Platform, uid } from 'quasar';

import {
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';

import type { UserRole } from 'models/firebase-auth/index.js';
import { adminRole } from 'models/firebase-auth/index.js';

import { useFirebaseAuthStore } from 'stores/FirebaseAuth.js';

import { createRemoteSignInToken, isAuthenticated, signOut } from 'services/firebase-auth.js';
import { getAuth } from 'services/firebase.js';

export default function () {
  // Private

  const remoteWindows: Record<string, { remoteWindow: Window; token: string } | undefined> = {};

  // Composables

  const router = useRouter();
  const route = useRoute();
  const store = useFirebaseAuthStore();

  // Computed

  const isAuthenticatedComputed = computed(() => isAuthenticated());

  const authenticatedUser = computed(
    () =>
      store.currentUser ||
      (() => {
        throw new Error('[mnapp-firebase-auth] Cannot retrieve unauthenticated user.');
      })(),
  );

  const roles = computed(() => store.currentUserRoles);

  const isSignInPage = computed(() => route.name === 'SignIn');

  // Methods

  function hasRole(role: UserRole) {
    return roles.value.includes(adminRole) || roles.value.includes(role);
  }

  async function signInWithGoogle() {
    const authInstance = getAuth();
    const provider = new GoogleAuthProvider();

    // On desktop, use popup for Identity Providers sign-in flow instead of the default, redirect
    if (Platform.is.desktop) {
      await signInWithPopup(authInstance, provider);
      void router.replace((route.params.returnUrl as string | undefined)?.slice(3) || '/'); // Remove '?r=' from `returnUrl`
    } else {
      // On mobile, use redirect
      await signInWithRedirect(authInstance, provider);
      // The app will be redirected back to SignIn page after authenticating with Identity Provider.
      // The app will then handle the redirect and navigate to the `returnUrl` in the `router.beforeEach()` guard in `boot/firebase-auth.ts`.
    }
  }

  function setupRemoteSignIn() {
    let remoteTokenTimeout: ReturnType<typeof setTimeout>;

    const handleMessage = (ev: MessageEvent<Record<'type' | 'value', string>>) => {
      if (ev.data.type === 'loginToken') {
        clearTimeout(remoteTokenTimeout);

        const loginToken = ev.data.value;
        const auth = getAuth();

        signInWithCustomToken(auth, loginToken)
          .then(() => {
            void router.replace('/');
          })
          .catch((error) => {
            console.error(error);
            void router.replace({ name: 'SignIn' });
          });
      }
    };

    const opener = window.opener as Window;
    if (opener) {
      const key = route.params.key;

      window.onmessage = handleMessage;
      opener.postMessage(
        {
          type: 'windowKey',
          value: key,
        },
        '*',
      );

      remoteTokenTimeout = setTimeout(() => {
        void router.replace({ name: 'SignIn' });
      }, 1000);
    } else {
      void router.replace({ name: 'SignIn' });
    }
  }

  function setupRemoteSignInResponse() {
    const handleMessage = (ev: MessageEvent<Record<'type' | 'value', string>>) => {
      if (ev.data.type === 'windowKey') {
        const windowKey = ev.data.value;
        const item = remoteWindows[windowKey];

        remoteWindows[windowKey] = undefined;
        item?.remoteWindow.postMessage(
          {
            type: 'loginToken',
            value: item.token,
          },
          '*',
        );
      }
    };

    window.onmessage = handleMessage;
  }

  async function remoteNavigate(remoteSite: string) {
    const key = uid();
    const token = await createRemoteSignInToken();

    // Safari is blocking any call to window.open() which is made inside an async call.
    // Wrapping window.open() in the async function with a setTimeout.
    // setTimeout code runs on the main thread, instead of the asynchronous one.
    setTimeout(() => {
      const remoteWindow = window.open(`${remoteSite}/auth/remote-sign-in/${key}`, '_blank');

      if (remoteWindow) {
        remoteWindows[key] = {
          remoteWindow,
          token,
        };
      }
    });
  }

  return {
    isAuthenticated: isAuthenticatedComputed,
    authenticatedUser,
    roles,
    isSignInPage,
    hasRole,
    signInWithGoogle,
    signOut,
    setupRemoteSignIn,
    setupRemoteSignInResponse,
    remoteNavigate,
  };
}
