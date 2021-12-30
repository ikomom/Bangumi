/*
 * @Author: czy0729
 * @Date: 2021-12-25 22:07:27
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-12-31 07:06:53
 */
import { Dimensions } from 'react-native'
import DeviceInfo from 'react-native-device-info'

const PAD_LEVEL_1 = 616
const PAD_LEVEL_2 = 900

const { width, height } = Dimensions.get('window')
const minSide = Math.min(width, height)
const maxSide = Math.max(width, height)
let isPad = 0

// 暂时认为长边 <= 短边 * 1.6, 且短边 >= PAD_LEVEL_1, 是平板
if (maxSide <= minSide * 1.6 && minSide >= PAD_LEVEL_1) {
  isPad = minSide >= PAD_LEVEL_2 ? 2 : 1
}

if (!isPad && DeviceInfo.isTablet()) {
  isPad = minSide >= PAD_LEVEL_2 ? 2 : 1
}

const PAD = isPad
const RATIO = PAD === 2 ? 1.64 : PAD === 1 ? 1.44 : 1

export { PAD, PAD_LEVEL_1, PAD_LEVEL_2, RATIO }
