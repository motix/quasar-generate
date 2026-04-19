import fs from 'fs';
import { extendJsonFile } from '../json-helpers.js';
// Patch `vite-plugin-checker` to solve the error `TypeError: FlatESLint is not a constructor` of ESLint 10.
export default function patchVitePluginChecker(options) {
    if (options.monorepoWorkspaceFolder != undefined) {
        fs.mkdirSync(`${options.monorepoWorkspaceFolder}/.yarn/patches`, { recursive: true });
        fs.writeFileSync(`${options.monorepoWorkspaceFolder}/.yarn/patches/vite-plugin-checker-npm-0.12.0-0000000000.patch`, `diff --git a/dist/checkers/eslint/main.js b/dist/checkers/eslint/main.js
index 27a775515049aa60f23c2778632b86d2db6d3513..28dbef5303639bea2d53e5cc8727deced3cb47ba 100644
--- a/dist/checkers/eslint/main.js
+++ b/dist/checkers/eslint/main.js
@@ -60,19 +60,26 @@ const createDiagnostic = (pluginConfig) => {
       };
       let eslint;
       if (pluginConfig.eslint.useFlatConfig) {
-        const {
-          FlatESLint,
-          shouldUseFlatConfig
-        } = require2("eslint/use-at-your-own-risk");
-        if (shouldUseFlatConfig == null ? void 0 : shouldUseFlatConfig()) {
-          eslint = new FlatESLint({
-            cwd: root
-          });
+        let ESLintClass;
+        const { loadESLint } = require2("eslint");
+        if (loadESLint) {
+          ESLintClass = await loadESLint({ useFlatConfig: true });
         } else {
-          throw Error(
-            "Please upgrade your eslint to latest version to use \`useFlatConfig\` option."
-          );
+          const {
+            FlatESLint,
+            shouldUseFlatConfig
+          } = require2("eslint/use-at-your-own-risk");
+          if (shouldUseFlatConfig == null ? void 0 : shouldUseFlatConfig()) {
+            ESLintClass = FlatESLint;
+          } else {
+            throw Error(
+              "Please upgrade your eslint to latest version to use \`useFlatConfig\` option."
+            );
+          }
         }
+        eslint = new ESLintClass({
+          cwd: root
+        });
       } else {
         eslint = new ESLint(eslintOptions);
       }
`, 'utf-8');
    }
    if (options.targetPackageJsonFilePath !== undefined) {
        extendJsonFile(options.targetPackageJsonFilePath, [
            {
                path: 'devDependencies.vite-plugin-checker',
                value: 'patch:vite-plugin-checker@npm%3A0.12.0#~/.yarn/patches/vite-plugin-checker-npm-0.12.0-0000000000.patch',
            },
        ]);
    }
}
