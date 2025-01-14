/*
 * @Author: czy0729
 * @Date: 2022-09-29 17:05:23
 * @Last Modified by:   czy0729
 * @Last Modified time: 2022-09-29 17:05:23
 */
import { _ } from '@stores'

export const styles = _.create({
  container: {
    marginTop: _.platforms(4, -8, 0, -14),
    marginLeft: _.device(-_.md, -_.sm),
    marginRight: _.md
  }
})
