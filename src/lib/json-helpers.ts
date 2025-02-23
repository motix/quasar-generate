import fs from 'fs'
import { get, isArray, set, unset } from 'lodash-es'

export function extendJsonFile(
  filePath: string,
  pathAdnValues: { path: string | Array<string>; value: unknown }[],
) {
  const json = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }))

  if (json) {
    for (let { path, value } of pathAdnValues) {
      if (typeof path === 'string' && path.endsWith('[]')) {
        path = path.substring(0, path.length - 2)
        const currentValue: Array<typeof value> = get(json, path)

        if (!currentValue.includes(value)) {
          currentValue.push(value)
        }

        value = currentValue
      }

      set(json, path, value)
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2))
  }
}

export function reduceJsonFile(filePath: string, paths: string[], removeIfEmpty?: string[]) {
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
  filePath: string,
  pathAndValues: { path: string; value: unknown }[],
  removeIfEmpty?: string[],
) {
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
