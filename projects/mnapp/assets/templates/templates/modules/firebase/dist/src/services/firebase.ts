import firebaseConfig from 'app/firebase.json' with { type: 'json' };

import type { Auth } from 'firebase/auth';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import type { Functions } from 'firebase/functions';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import type { FirebaseStorage } from 'firebase/storage';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

import useConfig from 'composables/useConfig.js';

const host = window.location.hostname;

let auth: Auth;
function getAuthOrEmulator() {
  if (auth) {
    return auth;
  }

  auth = getAuth();

  if (process.env.FIREBASE_ENV === 'DEV') {
    connectAuthEmulator(auth, `http://${host}:${firebaseConfig.emulators.auth.port}`, {
      disableWarnings: !!process.env.DEBUGGING,
    });
  }

  return auth;
}

let firestore: Firestore;
function getFirestoreOrEmulator() {
  if (firestore) {
    return firestore;
  }

  firestore = getFirestore();

  if (process.env.FIREBASE_ENV === 'DEV') {
    connectFirestoreEmulator(firestore, host, firebaseConfig.emulators.firestore.port);
  }

  return firestore;
}

let storage: FirebaseStorage;
function getStorageOrEmulator() {
  if (storage) {
    return storage;
  }

  storage = getStorage();

  if (process.env.FIREBASE_ENV === 'DEV') {
    connectStorageEmulator(storage, host, firebaseConfig.emulators.storage.port);
  }

  return storage;
}

let functions: Functions;
function getFunctionsOrEmulator() {
  if (functions) {
    return functions;
  }

  functions = getFunctions();
  const { firebaseRegion } = useConfig();

  if (firebaseRegion) {
    functions.region = firebaseRegion;
  }

  if (process.env.FIREBASE_ENV === 'DEV') {
    connectFunctionsEmulator(functions, host, firebaseConfig.emulators.functions.port);
  }

  return functions;
}

export {
  getAuthOrEmulator as getAuth,
  getFirestoreOrEmulator as getFirestore,
  getFunctionsOrEmulator as getFunctions,
  getStorageOrEmulator as getStorage,
};
