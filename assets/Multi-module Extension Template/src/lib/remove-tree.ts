import type { UninstallAPI } from '@quasar/app-vite'

import fs from 'fs'
import path from 'path'

// @ts-expect-error Importing from a specific path in node_modules
import { getCallerPath } from '../../node_modules/@quasar/app-vite/lib/utils/get-caller-path.js'

export default function (
  api: UninstallAPI,
  templatePath: string,
  options?: {
    knownPaths?: string[]
    excludePaths?: string[]
    removeIfEmpty?: string[]
  },
) {
  const callerPath: string = getCallerPath()
  const absoluteTemplatePath = path.resolve(callerPath, templatePath)

  const paths = fs.readdirSync(absoluteTemplatePath)

  for (const currentPath of paths) {
    removePath(api, absoluteTemplatePath, currentPath, [
      ...(options?.knownPaths || []),
      ...(options?.excludePaths || []),
    ])
  }

  options?.knownPaths?.forEach((value) => api.removePath(value))

  options?.removeIfEmpty?.forEach((value) => {
    const absolutePath = api.resolve.app(value)

    if (fs.existsSync(absolutePath)) {
      if (fs.lstatSync(absolutePath).isFile()) {
        throw new Error('removeIfEmpty option cannot remove file.')
      } else {
        fs.readdirSync(absolutePath).length === 0 && api.removePath(value)
      }
    }
  })
}

function removePath(
  api: UninstallAPI,
  absoluteTemplatePath: string,
  relativePath: string,
  excludePaths: string[],
) {
  const absolutePath = path.resolve(absoluteTemplatePath, relativePath)

  if (excludePaths.includes(relativePath)) {
    return
  }

  if (fs.lstatSync(absolutePath).isFile()) {
    api.removePath(relativePath)
  } else {
    const paths = fs.readdirSync(absolutePath)

    for (const currentPath of paths) {
      removePath(api, absoluteTemplatePath, path.join(relativePath, currentPath), excludePaths)
    }
  }
}
