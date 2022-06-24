/*
 * @Author: czy0729
 * @Date: 2022-06-17 12:18:41
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-06-17 12:19:02
 */
import { _ } from '@stores'
import { IMG_WIDTH, IMG_HEIGHT } from '@constants'

export const memoStyles = _.memoStyles(() => ({
  container: {
    paddingLeft: _.wind
  },
  imgContainer: {
    width: IMG_WIDTH
  },
  wrap: {
    paddingVertical: _.md,
    paddingRight: _.wind
  },
  content: {
    height: IMG_HEIGHT
  },
  comments: {
    padding: _.sm,
    marginBottom: _.sm,
    backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel1),
    borderWidth: _.select(_.hairlineWidth, 0),
    borderColor: _.colorBorder,
    borderRadius: _.radiusXs,
    overflow: 'hidden'
  },
  katakanas: {
    marginTop: -6
  },
  collection: {
    position: 'absolute',
    zIndex: 1,
    top: 1 * _.lineHeightRatio,
    left: 0
  },
  edit: {
    marginTop: _.sm,
    marginRight: -_.xs
  },
  hidden: {
    width: 28,
    height: 16,
    paddingHorizontal: _.xs,
    paddingVertical: 1,
    backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel1),
    borderWidth: _.hairlineWidth,
    borderRadius: _.radiusXs,
    borderColor: _.select(_.colorBorder, _._colorDarkModeLevel1)
  },
  tag: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: _.sm,
    backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel1),
    borderRadius: _.radiusXs,
    overflow: 'hidden'
  }
}))