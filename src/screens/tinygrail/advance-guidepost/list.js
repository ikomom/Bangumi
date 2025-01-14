/*
 * @Author: czy0729
 * @Date: 2020-01-08 11:55:21
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-06-08 11:57:19
 */
import React from 'react'
import { ListView, Loading } from '@components'
import { _ } from '@stores'
import { keyExtractor } from '@utils/app'
import { obc } from '@utils/decorators'
import ItemAdvance from '../_/item-advance'

function List(props, { $ }) {
  const { _loaded } = $.advanceList
  if (!_loaded) {
    return <Loading style={_.container.flex} color={_.colorTinygrailText} />
  }

  const event = {
    id: '卖一推荐.跳转',
    data: {
      userId: $.myUserId
    }
  }
  const renderItem = ({ item, index }) => (
    <ItemAdvance index={index} event={event} {...item} />
  )

  return (
    <ListView
      style={_.container.flex}
      contentContainerStyle={_.container.bottom}
      keyExtractor={keyExtractor}
      refreshControlProps={{
        color: _.colorTinygrailText
      }}
      footerTextType='tinygrailText'
      data={$.advanceList}
      windowSize={6}
      initialNumToRender={24}
      maxToRenderPerBatch={24}
      updateCellsBatchingPeriod={24}
      lazy={24}
      scrollToTop
      renderItem={renderItem}
      onHeaderRefresh={$.fetchAdvanceList}
    />
  )
}

export default obc(List, {
  title: '全部'
})
