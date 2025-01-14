/*
 * @Author: czy0729
 * @Date: 2019-10-14 22:46:45
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-14 12:57:34
 */
import React from 'react'
import { obc } from '@utils/decorators'
import { MODEL_RAKUEN_SCROLL_DIRECTION } from '@constants'
import { RakuenScrollDirection } from '@types'
import { Ctx } from '../types'
import { TouchScroll } from './touch-scroll'
import { memoStyles } from './styles'

export default obc(({ onPress }, { $ }: Ctx) => {
  global.rerender('Topic.TouchScroll')

  const { scrollDirection } = $.setting
  const { list } = $.comments
  if (
    scrollDirection ===
      MODEL_RAKUEN_SCROLL_DIRECTION.getValue<RakuenScrollDirection>('隐藏') ||
    !list.length
  ) {
    return null
  }

  return (
    <TouchScroll
      styles={memoStyles()}
      list={list}
      readedTime={$.readed._time}
      scrollDirection={scrollDirection}
      reverse={$.state.reverse}
      isWebLogin={$.isWebLogin}
      onPress={onPress}
    />
  )
})
