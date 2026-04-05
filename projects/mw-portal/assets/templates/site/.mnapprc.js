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
    'select-date-range': false,
    utils: true,
    'page-title': true,
    'shared-components': true,
    'document-status': false,
    notifications: true,
    scroll: false,
    'float-toolbar': false,
    'sticky-headers': false,
    'multi-views': false,
    'return-url': false,
    apexcharts: false,
    'export-to-excel': false,
    firebase: {
      prompts: {
        project: 'motiwiki-2022',
        authEmulatorPort: '4001',
        functionsEmulatorPort: '5001',
        firestoreEmulatorPort: '6001',
        storageEmulatorPort: '2001',
      },
    },
    'firebase-auth': {
      prompts: {
        userRoles: 'manager,maintenance,hr,production,finance,inventory,project-leader',
      },
    },
    'firebase-firestore': false,
    'rich-editor': false,
    slack: false,
    'single-scope-composable': false,
    'alive-sub-layout': true,
    'crud-pages': false,
    'app-default': {
      prompts: {
        devServerPort: 9001,
        https: false,
        dark: true,
      },
    },
  },
};
