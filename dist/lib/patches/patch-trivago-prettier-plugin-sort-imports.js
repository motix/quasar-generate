import fs from 'fs';
import { extendJsonFile } from '../json-helpers.js';
// Patch `@trivago/prettier-plugin-sort-imports`.
export default function patchTrivagoPrettierPluginSortImports(options) {
    if (options.rootWorkspaceFolder !== undefined) {
        fs.mkdirSync(`${options.rootWorkspaceFolder}/.yarn/patches`, { recursive: true });
        fs.writeFileSync(`${options.rootWorkspaceFolder}/.yarn/patches/@trivago-prettier-plugin-sort-imports-npm-6.0.2-0000000000.patch`, `diff --git a/lib/src/preprocessors/vue-preprocessor.js b/lib/src/preprocessors/vue-preprocessor.js
index 41b5bc94b0fb8406f74a952e2b9afb01510da617..bae2dffc50c8afc4b1c856e7cd832f4d02dc7f20 100644
--- a/lib/src/preprocessors/vue-preprocessor.js
+++ b/lib/src/preprocessors/vue-preprocessor.js
@@ -1,7 +1,9 @@
+import { createRequire } from 'module';
+const require = createRequire(import.meta.url);
 import { preprocessor } from './preprocessor.js';
 let vueCompilerSfc;
 try {
-    vueCompilerSfc = await import('@vue/compiler-sfc');
+    vueCompilerSfc = require('@vue/compiler-sfc');
 }
 catch {
     // Do not error because the dependency is optional.
`, { encoding: 'utf-8' });
    }
    if (options.targetPackageJsonFilePath !== undefined) {
        extendJsonFile(options.targetPackageJsonFilePath, [
            {
                path: 'devDependencies.@trivago/prettier-plugin-sort-imports',
                value: 'patch:@trivago/prettier-plugin-sort-imports@npm%3A6.0.2#~/.yarn/patches/@trivago-prettier-plugin-sort-imports-npm-6.0.2-0000000000.patch',
            },
        ]);
    }
}
