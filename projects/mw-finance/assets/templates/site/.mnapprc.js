export default {
  modules: {
    'map-paths': true,
    frameworks: true,
    vendors: {
      prompts: {
        vendors: 'fap,lds,atm,vld',
      },
    },
    config: true,
    formats: true,
    'select-date-range': true,
    utils: true,
    'page-title': true,
    'shared-components': true,
    'document-status': true,
    notifications: true,
    scroll: true,
    'float-toolbar': true,
    'sticky-headers': true,
    'multi-views': true,
    'return-url': true,
    apexcharts: false,
    'export-to-excel': true,
    firebase: {
      prompts: {
        project: 'motiwiki-2022',
        targetName: 'finance',
        siteId: 'motiwiki-2022-finance',
        authEmulatorPort: '4001',
        functionsEmulatorPort: '5001',
        firestoreEmulatorPort: '6001',
        storageEmulatorPort: '2001',
      },
    },
    'firebase-auth': {
      prompts: {
        userRoles: 'manager,maintenance,finance',
      },
    },
    'firebase-firestore': true,
    'rich-editor': true,
    slack: true,
    'single-scope-composable': true,
    'alive-sub-layout': true,
    'crud-pages': true,
    'app-default': {
      prompts: {
        devServerPort: 9004,
        https: false,
        dark: true,
      },
    },
  },
};
