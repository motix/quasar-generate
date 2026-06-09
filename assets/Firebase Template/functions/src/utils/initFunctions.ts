import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';

initializeApp();

// Required roles for service account:
// - Cloud Run Invoker (v2 functions)
// - Cloud Functions Invoker (v1 functions)
// - Cloud Datastore User (Firestore usage)
// - Eventarc Event Receiver (functions triggering)

setGlobalOptions({
  region: '__REGION__',
});
