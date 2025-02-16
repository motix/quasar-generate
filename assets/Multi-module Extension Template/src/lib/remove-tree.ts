import type { UninstallAPI } from '@quasar/app-vite'

import fs from 'fs'
import path from 'path'

import { getCallerPath } from '../../node_modules/@quasar/app-vite/lib/utils/get-caller-path.js'

export default function (
  api: UninstallAPI,
  templatePath: string,
  knownPaths?: string[],
  excludePaths?: string[],
) {
  const dir: string = getCallerPath()
  const absolutePath = path.resolve(dir, templatePath)

  const paths = fs.readdirSync(absolutePath)

  for (const currentPath of paths) {
    removePath(api, absolutePath, currentPath, [...(knownPaths || []), ...(excludePaths || [])])
  }

  knownPaths?.forEach((value) => api.removePath(value))
}

function removePath(
  api: UninstallAPI,
  templatePath: string,
  relativePath: string,
  excludePaths: string[],
) {
  const absolutePath = path.resolve(templatePath, relativePath)

  if (excludePaths.includes(relativePath)) {
    return
  }

  if (fs.lstatSync(absolutePath).isFile()) {
    api.removePath(relativePath)
  } else {
    const paths = fs.readdirSync(absolutePath)

    for (const currentPath of paths) {
      removePath(api, templatePath, path.join(relativePath, currentPath), excludePaths)
    }
  }
}
