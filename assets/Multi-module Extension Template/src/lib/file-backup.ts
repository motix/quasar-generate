import type { BaseAPI } from '@quasar/app-vite'

import fs from 'fs'
import path from 'path'

export function backupFile(api: BaseAPI, relativePath: string) {
  const filePath = api.resolve.app(relativePath)
  const fileBackupPath = api.resolve.app(`.bk/${relativePath}`)
  const backupDir = path.dirname(fileBackupPath)

  !fs.existsSync(backupDir) && fs.mkdirSync(backupDir, { recursive: true })
  !fs.existsSync(fileBackupPath) && fs.copyFileSync(filePath, fileBackupPath)
}

export function backupAndDeleteFile(api: BaseAPI, relativePath: string) {
  backupFile(api, relativePath)
  fs.rmSync(api.resolve.app(relativePath))
}

export function restoreFile(api: BaseAPI, relativePath: string) {
  const filePath = api.resolve.app(relativePath)
  const fileBackupPath = api.resolve.app(`.bk/${relativePath}`)
  const restoreDir = path.dirname(filePath)

  if (fs.existsSync(fileBackupPath)) {
    !fs.existsSync(restoreDir) && fs.mkdirSync(restoreDir, { recursive: true })
    fs.copyFileSync(fileBackupPath, filePath)
  }
}
