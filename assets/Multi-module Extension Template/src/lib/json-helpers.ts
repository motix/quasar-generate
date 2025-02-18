import type { BaseAPI } from '@quasar/app-vite'

import fs from 'fs'
import { get, isArray, unset } from 'lodash-es'

export function reduceJsonFile(
  api: BaseAPI,
  file: string,
  paths: string[],
  removeIfEmpty?: string[],
) {
  const filePath = api.resolve.app(file)
  const json = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : undefined

  if (json) {
    for (const path of paths) {
      unset(json, path)
    }

    if (removeIfEmpty !== undefined) {
      for (const path of removeIfEmpty) {
        const value = get(json, path)

        if ((isArray(value) && value.length === 0) || Object.keys(value).length === 0) {
          unset(json, path)
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2))
  }
}

export function reduceJsonFileArray(
  api: BaseAPI,
  file: string,
  pathAndValues: { path: string; value: unknown }[],
  removeIfEmpty?: string[],
) {
  const filePath = api.resolve.app(file)
  const json = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : undefined

  if (json) {
    for (const { path, value } of pathAndValues) {
      const values = get(json, path)

      values?.includes(value) && values.splice(values.indexOf(value), 1)
    }

    if (removeIfEmpty !== undefined) {
      for (const path of removeIfEmpty) {
        const value = get(json, path)

        if ((isArray(value) && value.length === 0) || Object.keys(value).length === 0) {
          unset(json, path)
        }
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2))
  }
}
