import fs from 'fs'

const path = `node_modules/@quasar/app-vite/lib/app-extension/AppExtensionInstance.js`
let content = fs.readFileSync(path, 'utf-8')

content = content.replace(
  `return getPackageScriptPath(
      this.packageFullName,
      scriptName,
      this.#packagePath
    )`,
  `return getPackageScriptPath(
      this.packageFullName,
      scriptName,
      // this.#packagePath
      this.#ctx.appPaths.appDir
    )`,
)

fs.writeFileSync(path, content, {
  encoding: 'utf-8',
})
