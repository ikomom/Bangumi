/*
 * @Author: czy0729
 * @Date: 2022-08-28 00:22:39
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-28 00:51:34
 */
import { _ } from '@stores'
import { IMG_HEIGHT_SM } from '@constants'

export const memoStyles = _.memoStyles(() => ({
  loading: {
    height: 120
  },
  item: {
    paddingHorizontal: _.wind,
    paddingVertical: _.md + 8
  },
  body: {
    height: IMG_HEIGHT_SM,
    paddingLeft: _.md
  },
  manage: {
    marginTop: -2
  }
}))
