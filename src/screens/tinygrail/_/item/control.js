/*
 * @Author: czy0729
 * @Date: 2021-03-03 23:46:50
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-07-03 16:04:36
 */
import React from 'react'
import { IconTouchable } from '@_'
import { tinygrailStore, _ } from '@stores'
import { obc } from '@utils/decorators'
import { confirm } from '@utils/ui'
import Popover from '../popover'
import StockPreview from '../stock-preview'

function Control(props) {
  const {
    _subject,
    _subjectId,
    _relation,
    id,
    type,
    monoId,
    event,
    showMenu,
    state,
    end,
    withoutFeedback,
    onAuctionCancel
  } = props
  const isICO = !!end
  const isAuction = type === 'auction'

  let auctionText = '竞拍中'
  if (type === 'auction') {
    if (state === 1) {
      auctionText = '成功'
    } else if (state === 2) {
      auctionText = '失败'
    }
  }
  const auctioning = auctionText === '竞拍中'
  return (
    <>
      {isAuction && auctioning && (
        <IconTouchable
          style={styles.auctionCancel}
          name='md-close'
          color={_.colorTinygrailPlain}
          size={18}
          withoutFeedback={withoutFeedback}
          onPress={() => {
            confirm('周六取消需要收取手续费, 确定取消?', () => onAuctionCancel(id))
          }}
        />
      )}
      {!isAuction && <StockPreview {...props} style={styles.stockPreview} _loaded />}
      {showMenu && !isICO && (
        <Popover
          event={event}
          id={monoId || id}
          relation={_relation}
          subject={_subject}
          subjectId={_subjectId}
          onCollect={tinygrailStore.toggleCollect}
        />
      )}
    </>
  )
}

export default obc(Control)

const styles = _.create({
  auctionCancel: {
    paddingVertical: _.md,
    paddingLeft: _.sm,
    marginTop: 1.5
  },
  stockPreview: {
    marginTop: -0.5,
    marginRight: -12
  }
})
