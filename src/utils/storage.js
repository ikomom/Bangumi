/*
 * @Author: czy0729
 * @Date: 2022-04-13 04:14:20
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-04-13 04:31:50
 */
import AsyncStorage from '@components/@/react-native-async-storage'
import { DEV } from '@constants'
import { queue } from './utils'

// 本地化字符串大于此值会延迟合并再写入
const LAZY_SET_STORAGE_SIZE = 2048

// 延迟写入间隔
const LAZY_SET_STORAGE_INTERVAL = 60000

/**
 * 读取数据
 * @version 190321 1.0
 * @param {*} key
 */
export async function getStorage(key) {
  try {
    if (!key) return null

    const data = await AsyncStorage.getItem(key)
    return Promise.resolve(JSON.parse(data))
  } catch (error) {
    return Promise.resolve(null)
  }
}

/**
 * 保存数据
 * @version 190321 1.0
 * @version 211112 2.0
 * @param {*} key
 * @param {*} data
 */
const setStorageLazyMap = {}
export async function setStorage(key, data) {
  if (!key) return

  const _data = JSON.stringify(data)
  if (_data.length >= LAZY_SET_STORAGE_SIZE) {
    setStorageLazyMap[key] = _data
    return
  }

  AsyncStorage.setItem(key, _data)

  if (DEV) {
    console.info(
      'setStorage',
      key,
      `${(JSON.stringify(data).length / 1000).toFixed(2)}kb`
    )
  }
}

/**
 * @version 211112 数据较大的键, 合并没必要的多次写入
 */
let setStorageInterval
if (setStorageInterval) clearInterval(setStorageInterval)

setStorageInterval = setInterval(async () => {
  const keys = Object.keys(setStorageLazyMap)
  if (!keys.length) return

  const setItems = []
  keys.forEach(key => {
    setItems.push(async () => {
      AsyncStorage.setItem(key, setStorageLazyMap[key])
      delete setStorageLazyMap[key]

      if (DEV) {
        console.info(
          'setStorageLazy',
          key,
          `${(setStorageLazyMap[key].length / 1000).toFixed(2)}kb`
        )
      }
    })
  })

  queue(setItems, 1)
}, LAZY_SET_STORAGE_INTERVAL)