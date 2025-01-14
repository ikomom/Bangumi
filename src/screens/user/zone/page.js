/*
 * @Author: czy0729
 * @Date: 2019-05-06 00:28:26
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-16 07:17:57
 */
import React from 'react'
import { Animated, View } from 'react-native'
import { StatusBarEvents, Track } from '@components'
import { NavigationBarEvents } from '@_'
import { uiStore, _ } from '@stores'
import { obc } from '@utils/decorators'
import ParallaxImage from './parallax-image'
import Tab from './tab'
import UsedModal from './used-modal'
import Heatmaps from './heatmaps'

const title = '空间'

class Zone extends React.Component {
  onSwipeStart = () => {
    const { $ } = this.context
    $.updatePageOffset()
  }

  onIndexChange = () => {
    setTimeout(() => {
      const { $ } = this.context
      $.updatePageOffset([0])
    }, 0)
  }

  onScroll = e => {
    const { $ } = this.context
    $.onScroll(e)
    uiStore.closePopableSubject()
  }

  render() {
    const { $ } = this.context
    const { _loaded } = $.state
    if (!_loaded) return <View style={_.container.plain} />

    const { visible } = $.state
    return (
      <View style={_.container.plain}>
        <StatusBarEvents barStyle='light-content' backgroundColor='transparent' />
        <NavigationBarEvents />
        <Tab
          scrollEventThrottle={16}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: {
                    y: $.scrollY
                  }
                }
              }
            ],
            {
              useNativeDriver: true,
              listener: this.onScroll
            }
          )}
          onSwipeStart={this.onSwipeStart}
          onIndexChange={this.onIndexChange}
        />
        <ParallaxImage />
        <UsedModal visible={visible} defaultAvatar={$.src} />
        <Track title={title} hm={[`user/${$.params.userId}?route=zone`, 'Zone']} />
        <Heatmaps />
      </View>
    )
  }
}

export default obc(Zone)
