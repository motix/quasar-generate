import fs from 'fs';
import { extendJsonFile } from '../json-helpers.js';
// Patch `@quasar/app-vite` to gain access to `@quasar/app-vite/lib/app-extension/api-classes/InstallAPI.js`
// and `@quasar/app-vite/lib/utils/get-caller-path.js`.
export default function patchQuasarAppVite(projectFolder, packageJsonFilePath) {
    extendJsonFile(packageJsonFilePath, [
        {
            path: 'devDependencies.@quasar/app-vite',
            value: 'patch:@quasar/app-vite@npm%3A2.5.4#~/.yarn/patches/@quasar-app-vite-npm-2.5.4-007016bf60.patch',
        },
    ]);
    fs.mkdirSync(`${projectFolder}/.yarn/patches`, { recursive: true });
    fs.writeFileSync(`${projectFolder}/.yarn/patches/@quasar-app-vite-npm-2.5.4-007016bf60.patch`, `diff --git a/package.json b/package.json
index 2e7ae61add3684688a04c2dae79405a058ee5862..c469c605365d5eeaa8e9011351ea5efdd4a54243 100644
--- a/package.json
+++ b/package.json
@@ -76,7 +76,13 @@
     },
     "./lib/testing.js": {
       "import": "./exports/testing/testing.js"
-    }
+    },
+    "./lib/app-extension/api-classes/InstallAPI.js": {
+      "import": "./lib/app-extension/api-classes/InstallAPI.js"
+    },
+    "./lib/utils/get-caller-path.js": {
+      "import": "./lib/utils/get-caller-path.js"
+     }
   },
   "publishConfig": {
     "access": "public"
`, { encoding: 'utf-8' });
}
