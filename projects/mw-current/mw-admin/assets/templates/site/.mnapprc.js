export default {
  modules: {
    'map-paths': true,
    frameworks: true,
    vendors: {
      prompts: {
        vendors: 'fap,lds,atm,vld,mkd',
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
    scroll: true,
    'float-toolbar': true,
    'sticky-headers': true,
    'multi-views': true,
    'return-url': true,
    apexcharts: false,
    'export-to-excel': false,
    firebase: {
      prompts: {
        project: 'motiwiki-2022',
        targetName: 'admin',
        siteId: 'motiwiki-2022-admin',
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
    'firebase-firestore': true,
    'rich-editor': false,
    slack: true,
    'single-scope-composable': true,
    'alive-sub-layout': true,
    'crud-pages': true,
    'app-default': {
      prompts: {
        devServerPort: 9002,
        https: false,
        dark: true,
      },
    },
  },
};
