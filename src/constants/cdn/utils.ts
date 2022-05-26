/*
 * @Author: czy0729
 * @Date: 2022-05-23 05:04:55
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-05-26 13:40:55
 */
import { getSystemStoreAsync } from '@utils/async'
import _hash from '@utils/thirdParty/hash'
import { SubjectId } from '@types'

/** 对图片完整地址进行哈希计算 */
export const hash = _hash

/** 获取云端设置 */
export function getOTA(): {
  [key: string]: string
} {
  return getSystemStoreAsync().ota
}

/** 自动判断需要使用的版本号 */
export function getVersion(key: string, version: any) {
  const ota = getOTA()
  return parseInt(ota[key]) > parseInt(version) ? ota[key] : version
}

/** repo 的目录显示文件数量有限, 所以根据 subjectId 每 100 划分为一个目录 */
export function getFolder(subjectId: SubjectId, split: 100 | 1000 = 100) {
  return parseInt(String(parseInt(String(subjectId)) / split))
}