/*
 * @Author: czy0729
 * @Date: 2022-01-21 13:46:59
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-01-23 18:00:08
 */
import React from 'react'
import { Heatmap } from '@components'
import { ItemSetting } from '@_'
import { _ } from '@stores'
import { open } from '@utils'
import { ob } from '@utils/decorators'
import { t } from '@utils/fetch'

function Zhinan() {
  return (
    <>
      <ItemSetting
        hd='使用指南'
        arrow
        arrowStyle={_.mr.xxs}
        arrowIcon='md-open-in-new'
        arrowSize={18}
        highlight
        onPress={() => {
          t('设置.跳转', {
            title: '个人设置',
            to: 'Zhinan'
          })

          open('https://www.yuque.com/chenzhenyu-k0epm/znygb4')
        }}
      >
        <Heatmap id='设置.跳转' to='Zhinan' alias='个人设置' />
      </ItemSetting>
      <ItemSetting
        style={_.mt.xs}
        hd='开发计划'
        arrow
        arrowStyle={_.mr.xxs}
        arrowIcon='md-open-in-new'
        arrowSize={18}
        highlight
        onPress={() => {
          t('设置.跳转', {
            title: '开发计划',
            to: 'Jihua'
          })

          open('https://wj.qq.com/s2/9645600/92c2/')
        }}
      >
        <Heatmap id='设置.跳转' to='Jihua' alias='开发计划' />
      </ItemSetting>
    </>
  )
}

export default ob(Zhinan)
