## Scripts

yarn && yarn buildPaths && yarn build && yarn clean && cd ./ext/dev && yarn i-mnapp && yarn i-motiwiki-2022-app && yarn dev

mv ./ext/dev/src/layouts/MainLayout.vue ./ext/dev/src/layouts/MainLayout_original.vue && mv ./ext/dev/src/layouts/MainLayout.txt ./ext/dev/src/layouts/MainLayout.vue && mv ./ext/dev/src/pages/IndexPage.vue ./ext/dev/src/pages/IndexPage_original.vue && mv ./ext/dev/src/pages/IndexPage.txt ./ext/dev/src/pages/IndexPage.vue

mv ./ext/dev/src/layouts/MainLayout.vue ./ext/dev/src/layouts/MainLayout.txt && mv ./ext/dev/src/layouts/MainLayout_original.vue ./ext/dev/src/layouts/MainLayout.vue && mv ./ext/dev/src/pages/IndexPage.vue ./ext/dev/src/pages/IndexPage.txt && mv ./ext/dev/src/pages/IndexPage_original.vue ./ext/dev/src/pages/IndexPage.vue

yarn add -D @motinet/quasar-app-extension-mnapp@portal:../../../quasar-app-extension-mnapp && yarn quasar ext invoke @motinet/mnapp && yarn clean

yarn r-motiwiki-2022-app

yarn r-mnapp && yarn r-motiwiki-2022-app
