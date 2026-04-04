## Scripts

yarn && yarn buildPaths && yarn build && yarn clean && cd ./quasar-app-extension-motiwiki-2022-app/dev && yarn i-mnapp && yarn i-motiwiki-2022-app && yarn dev

mv ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout.vue ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout_original.vue && mv ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout.txt ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout.vue && mv ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage.vue ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage_original.vue && mv ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage.txt ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage.vue

mv ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout.vue ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout.txt && mv ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout_original.vue ./quasar-app-extension-motiwiki-2022-app/dev/src/layouts/MainLayout.vue && mv ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage.vue ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage.txt && mv ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage_original.vue ./quasar-app-extension-motiwiki-2022-app/dev/src/pages/IndexPage.vue

yarn add -D @motinet/quasar-app-extension-mnapp@portal:../../../quasar-app-extension-mnapp && yarn quasar ext invoke @motinet/mnapp && yarn clean

yarn r-motiwiki-2022-app

yarn r-mnapp && yarn r-motiwiki-2022-app
