import fs from 'fs';
import { extendJsonFile } from '../json-helpers.js';
// Patch `vite-plugin-checker` to solve the error `TypeError: FlatESLint is not a constructor` of ESLint 10.
export default function patchVitePluginChecker(projectFolder, packageJsonFilePath, childWorkspaceOnly) {
    extendJsonFile(packageJsonFilePath, [
        {
            path: 'devDependencies.vite-plugin-checker',
            value: 'patch:vite-plugin-checker@npm%3A0.12.0#~/.yarn/patches/vite-plugin-checker-npm-0.12.0-20cc09e28e.patch',
        },
    ]);
    if (!childWorkspaceOnly) {
        fs.mkdirSync(`${projectFolder}/.yarn/patches`, { recursive: true });
        fs.writeFileSync(`${projectFolder}/.yarn/patches/vite-plugin-checker-npm-0.12.0-20cc09e28e.patch`, `diff --git a/dist/checkers/eslint/main.js b/dist/checkers/eslint/main.js
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
`, { encoding: 'utf-8' });
    }
}
