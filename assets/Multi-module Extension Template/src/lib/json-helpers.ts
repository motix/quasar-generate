import type { BaseAPI } from '@quasar/app-vite'

import fs from 'fs'
import { get, unset } from 'lodash-es'

export function reduceJsonFile(api: BaseAPI, file: string, paths: string[]) {
  const filePath = api.resolve.app(file)
  const json = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : undefined

  if (json) {
    for (const path of paths) {
      unset(json, path)
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2))
  }
}

export function reduceJsonFileArray(
  api: BaseAPI,
  file: string,
  pathAndValues: { path: string; value: unknown }[],
) {
  const filePath = api.resolve.app(file)
  const json = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : undefined

  if (json) {
    for (const { path, value } of pathAndValues) {
      const values = get(json, path)

      values?.includes(value) && values.splice(values.indexOf(value), 1)
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2))
  }
}
