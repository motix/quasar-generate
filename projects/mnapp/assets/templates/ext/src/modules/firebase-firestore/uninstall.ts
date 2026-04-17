import { defineUninstall } from '../index.js';

export default defineUninstall(function (api) {
  api.removeTemplateTree('dist', {
    knownPaths: [
      'src/models/firebase-firestore',
      'src/services/firebase-firestore',
      'src/stores/firebase-firestore',
    ],
  });
});
