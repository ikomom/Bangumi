/*
 * @Author: czy0729
 * @Date: 2019-10-19 21:28:24
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-07-17 04:08:24
 */
import React from 'react'
import { View } from 'react-native'
import { Flex, Iconfont, Text, Touchable } from '@components'
import { Eps, Cover } from '@_'
import { _ } from '@stores'
import { cnjp } from '@utils'
import { obc } from '@utils/decorators'
import { HTMLDecode } from '@utils/html'
import { t } from '@utils/fetch'
import { MODEL_SUBJECT_TYPE } from '@constants/model'
import { EpStatus, Subject, SubjectId } from '@types'
import { memoStyles } from './styles'
import { Ctx } from '../types'

class GridInfo extends React.Component<{
  subjectId?: SubjectId
  subject?: Subject
  epStatus?: EpStatus
}> {
  static defaultProps = {
    subjectId: 0,
    subject: {},
    epStatus: ''
  }

  onPress = () => {
    const { navigation } = this.context
    const { subjectId, subject } = this.props
    t('首页.跳转', {
      to: 'Subject',
      from: 'grid',
      subjectId
    })

    navigation.push('Subject', {
      subjectId,
      _jp: subject.name,
      _cn: subject.name_cn || subject.name,
      _image: subject?.images?.medium || ''
    })
  }

  onEpsSelect = (value, item) => {
    const { $, navigation } = this.context
    const { subjectId } = this.props
    $.doEpsSelect(value, item, subjectId, navigation)
  }

  onEpsLongPress = item => {
    const { $ } = this.context
    const { subjectId } = this.props
    $.doEpsLongPress(item, subjectId)
  }

  onCheckPress = () => {
    const { $ } = this.context
    const { subjectId } = this.props
    $.doWatchedNextEp(subjectId)
  }

  onStarPress = () => {
    const { $ } = this.context
    const { subjectId } = this.props
    $.showManageModal(subjectId)
  }

  get label() {
    const { subject } = this.props
    return MODEL_SUBJECT_TYPE.getTitle(subject.type)
  }

  renderBtnNextEp() {
    const { $ } = this.context
    const { subjectId } = this.props
    const { sort } = $.nextWatchEp(subjectId)
    if (!sort) return null

    return (
      <Touchable style={this.styles.touchable} onPress={this.onCheckPress}>
        <Flex justify='center'>
          <Iconfont style={this.styles.icon} name='md-check-circle-outline' size={18} />
          <View style={this.styles.placeholder}>
            <Text type='sub'>{sort}</Text>
          </View>
        </Flex>
      </Touchable>
    )
  }

  renderToolBar() {
    return (
      <Flex>
        {this.renderBtnNextEp()}
        <Touchable style={[this.styles.touchable, _.ml.sm]} onPress={this.onStarPress}>
          <Iconfont name='md-star-outline' size={19} />
        </Touchable>
      </Flex>
    )
  }

  renderCount() {
    const { $ } = this.context
    const { subjectId, subject, epStatus } = this.props
    if (this.label === '游戏') return null

    if (this.label === '书籍') {
      const { list = [] } = $.collection
      const { ep_status: epStatus, vol_status: volStatus } = list.find(
        item => item.subject_id === subjectId
      )
      return (
        <Flex justify='end'>
          <Text type='primary' size={20}>
            <Text type='primary' size={12} lineHeight={20}>
              Chap.{' '}
            </Text>
            {epStatus}
          </Text>
          {this.renderBookNextBtn(epStatus + 1, volStatus)}
          <Text style={_.ml.md} type='primary' size={20}>
            <Text type='primary' size={12} lineHeight={20}>
              Vol.{' '}
            </Text>
            {volStatus}
          </Text>
          {this.renderBookNextBtn(epStatus, volStatus + 1)}
        </Flex>
      )
    }

    return (
      <Text type='primary' size={20}>
        {epStatus || 1}
        <Text type='sub' lineHeight={20}>
          {' '}
          / {subject.eps_count || '?'}
        </Text>
      </Text>
    )
  }

  renderBookNextBtn(epStatus, volStatus) {
    const { $ } = this.context
    const { subjectId } = this.props
    return (
      <Touchable
        style={this.styles.touchable}
        onPress={() => $.doUpdateNext(subjectId, epStatus, volStatus)}
      >
        <Flex justify='center'>
          <Iconfont style={this.styles.icon} name='md-check-circle-outline' size={18} />
        </Flex>
      </Touchable>
    )
  }

  render() {
    global.rerender('Home.GridInfo')

    const { $ }: Ctx = this.context
    const { subjectId, subject } = this.props
    const isToday = $.isToday(subjectId)
    const isNextDay = $.isNextDay(subjectId)
    const { h, m } = $.onAirCustom(subjectId)

    const eps = $.eps(subjectId)
    const numberOfLines = _.isMobileLanscape ? 12 : _.device(7, 8)
    const imageWidth = _.isMobileLanscape ? 60 : this.styles.cover.width
    const imageHeight = imageWidth * 1.4
    const onAirStyle = _.isMobileLanscape ? _.mt.xs : _.mt.sm

    const _subject = $.subject(subjectId)
    const title = HTMLDecode(
      cnjp(_subject?.name_cn || subject.name_cn, _subject?.name || subject.name)
    )
    return (
      <Flex style={this.styles.item} align='start'>
        <View>
          <Cover
            size={imageWidth}
            height={imageHeight}
            src={subject?.images?.medium || ''}
            radius
            shadow
            onPress={this.onPress}
          />
          {isToday ? (
            <Text style={onAirStyle} type='success' align='center' size={12} bold>
              {h}:{m}
            </Text>
          ) : isNextDay ? (
            <Text style={onAirStyle} type='sub' align='center' size={12} bold>
              明天{h}:{m}
            </Text>
          ) : null}
        </View>
        <Flex.Item style={this.styles.info}>
          <Touchable onPress={this.onPress}>
            <Flex align='start'>
              <Flex.Item>
                <Text numberOfLines={eps.length >= 14 ? 1 : 2} bold>
                  {title}
                </Text>
              </Flex.Item>
            </Flex>
          </Touchable>
          <Flex style={_.device(undefined, _.mt.sm)}>
            <Flex.Item>{this.renderCount()}</Flex.Item>
            {this.renderToolBar()}
          </Flex>
          <Eps
            style={_.mt.xs}
            grid
            numbersOfLine={numberOfLines}
            lines={_.isMobileLanscape ? 1 : 3}
            login={$.isLogin}
            subjectId={subjectId}
            eps={eps}
            userProgress={$.userProgress(subjectId)}
            onSelect={this.onEpsSelect}
            onLongPress={this.onEpsLongPress}
          />
        </Flex.Item>
      </Flex>
    )
  }

  get styles() {
    return memoStyles()
  }
}

export default obc(GridInfo)
