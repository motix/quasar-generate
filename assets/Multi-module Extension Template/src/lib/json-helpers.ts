import type { BaseAPI } from '@quasar/app-vite'

import fs from 'fs'
import { get, unset } from 'lodash-es'

export async function reduceJsonFile(api: BaseAPI, file: string, paths: string[]) {
  const jsonPath = api.resolve.app(file)
  const json = (await import(jsonPath, { with: { type: 'json' } })).default

  if (json) {
    for (const path of paths) {
      unset(json, path)
    }

    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2))
  }
}

export async function reduceJsonFileArray(
  api: BaseAPI,
  file: string,
  pathAndValues: { path: string; value: unknown }[],
) {
  const jsonPath = api.resolve.app(file)
  const json = (await import(jsonPath, { with: { type: 'json' } })).default

  if (json) {
    for (const { path, value } of pathAndValues) {
      const values = get(json, path)

      values?.includes(value) && values.splice(values.indexOf(value), 1)
    }

    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2))
  }
}
