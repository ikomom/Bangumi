/*
 * @Author: czy0729
 * @Date: 2022-06-17 11:10:03
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-07-25 20:44:19
 */
import React from 'react'
import { View } from 'react-native'
import { Touchable, Flex, Text } from '@components'
import { _ } from '@stores'
import { cnjp } from '@utils'
import { t } from '@utils/fetch'
import { memo } from '@utils/decorators'
import { Cover, Stars, Rank } from '../../base'
import Collection from './collection'
import { HIT_SLOP, DEFAULT_PROPS } from './ds'

const Item = memo(
  ({
    navigation,
    style,
    gridStyles,
    id,
    name,
    nameCn,
    sub,
    cover,
    score,
    rank,
    typeCn,
    collection,
    userCollection,
    airtime,
    aid,
    wid,
    mid,
    isRectangle,
    event
  }) => {
    global.rerender('Component.ItemCollectionsGrid.Main')

    const onPress = () => {
      const { id: eventId, data: eventData } = event
      const subjectId = String(id).replace('/subject/', '')
      t(eventId, {
        to: 'Subject',
        subjectId,
        type: 'grid',
        ...eventData
      })

      navigation.push('Subject', {
        subjectId,
        _jp: name,
        _cn: nameCn,
        _image: cover,
        _aid: aid,
        _wid: wid,
        _mid: mid,
        _type: typeCn,
        _collection: collection || userCollection
      })
    }

    return (
      <View
        style={[
          {
            width: gridStyles.width,
            marginBottom: gridStyles.marginLeft + _.xs,
            marginLeft: gridStyles.marginLeft
          },
          style
        ]}
      >
        <Cover
          size={gridStyles.width}
          height={isRectangle ? gridStyles.width : gridStyles.height}
          src={cover}
          radius
          shadow
          type={typeCn}
          onPress={onPress}
        />
        <Touchable style={_.mt.xs} withoutFeedback hitSlop={HIT_SLOP} onPress={onPress}>
          <Text
            style={_.mt.sm}
            size={12}
            lineHeight={13}
            numberOfLines={3}
            bold
            align='center'
          >
            {cnjp(nameCn, name)}
          </Text>
          <Collection collection={collection} typeCn={typeCn} airtime={airtime} />
          {!!sub && (
            <Text
              style={_.mt.xs}
              size={11}
              lineHeight={11}
              type='sub'
              align='center'
              bold
              numberOfLines={1}
            >
              {sub}
            </Text>
          )}
          {!!score && (
            <Flex style={_.mt.sm} justify='center'>
              <Rank style={_.mr.xs} value={rank} size={9} />
              <Stars value={score} size={9} />
            </Flex>
          )}
        </Touchable>
      </View>
    )
  },
  DEFAULT_PROPS
)

export default Item
