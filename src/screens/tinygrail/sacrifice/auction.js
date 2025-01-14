/*
 * @Author: czy0729
 * @Date: 2019-11-17 15:33:52
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-03-16 06:31:38
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Input, Text, Button, Slider as CompSlider, Iconfont } from '@components'
import { IconTouchable, Popover } from '@_'
import { _ } from '@stores'
import { formatNumber, lastDate, toFixed } from '@utils'
import { obc } from '@utils/decorators'
import Stepper from './stepper'

const countDS = ['到500', '到2500', '到12500', '最大']

function Auction({ style }, { $ }) {
  const styles = memoStyles()
  const { showAuction, auctionLoading, auctionAmount, auctionPrice, lastAuction } =
    $.state
  const { price = 0, amount } = $.valhallChara
  const { balance } = $.assets
  const { state, type } = $.auctionStatus
  return (
    <View style={[styles.container, style]}>
      <Flex>
        <Flex.Item flex={1.2}>
          <Text type='tinygrailPlain' size={13}>
            竞拍
            {showAuction && (
              <Text type='tinygrailText' size={11} lineHeight={13}>
                {' '}
                底价 ({price ? toFixed(price + 0.01, 2) : '-'})
              </Text>
            )}
          </Text>
        </Flex.Item>
        {showAuction && (
          <Flex.Item>
            <Text type='tinygrailText' size={11}>
              数量 ({amount ? formatNumber(amount, 0) : '-'}股)
            </Text>
          </Flex.Item>
        )}
        <IconTouchable
          style={[_.ml.sm, _.mr._sm]}
          name={showAuction ? 'md-keyboard-arrow-up' : 'md-keyboard-arrow-down'}
          color={_.colorTinygrailText}
          onPress={$.toggleAuction}
        />
      </Flex>
      {showAuction && (
        <>
          <Flex style={_.mt.sm}>
            <Flex.Item flex={1.5}>
              <View style={styles.inputWrap}>
                <Stepper />
              </View>
            </Flex.Item>
            <Flex.Item style={_.ml.md}>
              <Flex style={styles.inputWrap}>
                <Input
                  style={styles.input}
                  keyboardType='numeric'
                  value={String(auctionAmount)}
                  clearButtonMode='never'
                  returnKeyType='done'
                  returnKeyLabel='竞拍'
                  onChangeText={$.changeAuctionAmount}
                  onSubmitEditing={$.doAuction}
                />
                <View style={styles.popover}>
                  <Popover data={countDS} onSelect={$.changeAuctionAmountByMenu}>
                    <Flex style={styles.count} justify='center'>
                      <Iconfont
                        name='md-keyboard-arrow-down'
                        color={_.colorTinygrailText}
                      />
                    </Flex>
                  </Popover>
                </View>
              </Flex>
            </Flex.Item>
            <View style={[styles.btnSubmit, _.ml.md]}>
              <Button
                style={styles.btnAuction}
                type='bid'
                radius={false}
                loading={auctionLoading}
                onPress={$.doAuction}
              >
                竞拍
              </Button>
            </View>
          </Flex>
          {!!lastAuction.time && (
            <Text style={_.mt.md} type='warning' size={12}>
              最近 ({lastAuction.price} / {formatNumber(lastAuction.amount, 0)}股 /{' '}
              {lastDate(lastAuction.time)})
            </Text>
          )}
          <Flex style={_.mt.md}>
            <Flex.Item>
              <Text type='tinygrailPlain' size={12}>
                合计{' '}
                <Text type='ask' size={12}>
                  -{formatNumber(auctionAmount * auctionPrice, 2, true)}
                </Text>
              </Text>
            </Flex.Item>
            <Text style={_.ml.sm} type='tinygrailText' size={12}>
              当前竞拍 {state}人 / {formatNumber(type, 0)}股
            </Text>
          </Flex>
          <Flex style={[styles.slider, _.mt.sm]}>
            <View style={_.container.block}>
              <CompSlider
                value={auctionAmount}
                min={0}
                max={parseInt(balance / Math.max(auctionPrice, price || 1))}
                step={1}
                minimumTrackTintColor={_.colorAsk}
                maximumTrackTintColor={_.colorTinygrailBorder}
                onChange={value => $.changeAuctionAmount(value)}
              />
            </View>
          </Flex>
          <Flex>
            <Flex.Item>
              <Text type='tinygrailText' size={12}>
                余额 0
              </Text>
            </Flex.Item>
            <Text type='tinygrailText' size={12}>
              {formatNumber(balance, 2, $.short)}
            </Text>
          </Flex>
        </>
      )}
    </View>
  )
}

export default obc(Auction)

const memoStyles = _.memoStyles(() => ({
  container: {
    paddingVertical: _.sm,
    paddingHorizontal: _.wind,
    backgroundColor: _.colorTinygrailBg
  },
  inputWrap: {
    paddingLeft: 4,
    borderColor: _.colorTinygrailBorder,
    borderWidth: 1
  },
  input: {
    height: 34,
    color: _.colorTinygrailPlain,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0
  },
  popover: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0
  },
  count: {
    width: 34,
    height: 34,
    borderLeftWidth: 1,
    borderColor: _.colorTinygrailBorder
  },
  slider: {
    height: 40
  },
  btnAuction: {
    height: 36
  },
  btnSubmit: {
    width: 72
  }
}))
