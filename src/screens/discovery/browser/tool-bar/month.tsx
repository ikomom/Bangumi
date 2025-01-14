/*
 * @Author: czy0729
 * @Date: 2022-06-04 07:06:35
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-01 13:58:17
 */
import React from 'react'
import { ToolBar } from '@components'
import { obc } from '@utils/decorators'
import { DATA_BROWSER_MONTH } from '@constants'
import { Ctx } from '../types'

function Month(props, { $ }: Ctx) {
  const { month } = $.state
  return (
    <ToolBar.Popover
      data={DATA_BROWSER_MONTH}
      text={`${month}月` || '月'}
      type='desc'
      heatmap='索引.月选择'
      onSelect={$.onMonthSelect}
    />
  )
}

export default obc(Month)
