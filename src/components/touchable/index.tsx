/*
 * 触摸反馈整合
 * 因封装前并未有<Pressable>，没必要前不会考虑重新整合
 * @Author: czy0729
 * @Date: 2019-03-28 15:35:04
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-13 15:32:21
 */
import React from 'react'
import {
  View,
  TouchableNativeFeedback as RNTouchableNativeFeedback,
  TouchableHighlight as RNTouchableHighlight,
  TouchableOpacity as RNTouchableOpacity
} from 'react-native'
import {
  TouchableNativeFeedback,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native-gesture-handler'
import { observer } from 'mobx-react'
import { _ } from '@stores'
import { getSystemStoreAsync } from '@utils/async'
import { DEV, IOS } from '@constants'
import { defaultHitSlop, styles, callOnceInInterval, separateStyles } from './utils'
import { Props as TouchableProps } from './types'

export { TouchableProps }

export const Touchable = observer(
  ({
    style,
    withoutFeedback = false,
    highlight = false,
    delay = true,
    hitSlop = defaultHitSlop,
    delayPressIn = 0,
    delayPressOut = 0,
    useRN = false,
    ripple,
    onPress = () => {},
    children,
    ...other
  }: TouchableProps) => {
    /**
     * @tofixed 安卓开发环境热使用 RNGH 的组件会导致 GestureHandler already initialized 问题, 暂时规避
     */
    const _useRN = !IOS && DEV ? true : useRN
    const passProps = {
      hitSlop,
      delayPressIn,
      delayPressOut,
      onPress: delay ? () => callOnceInInterval(onPress) : onPress
    }
    if (withoutFeedback) {
      const Component = _useRN ? RNTouchableOpacity : TouchableOpacity
      return (
        <Component style={style} activeOpacity={1} {...other} {...passProps}>
          <View>{children}</View>
        </Component>
      )
    }

    const _ripple = ripple === undefined ? getSystemStoreAsync().setting.ripple : ripple
    if (!IOS && _ripple) {
      // TouchableNativeFeedback 当 delayPressIn=0 时在安卓端触摸太快会触发涟漪, 需要延迟
      if (passProps.delayPressIn !== 0) passProps.delayPressIn = 80
      if (_useRN) {
        return (
          <View style={style}>
            <RNTouchableNativeFeedback {...other} {...passProps}>
              <View style={styles.touchable} />
            </RNTouchableNativeFeedback>
            {children}
          </View>
        )
      }

      const _styles = separateStyles(style)
      return (
        <View style={_styles.containerStyle}>
          <TouchableNativeFeedback style={_styles.style} {...other} {...passProps}>
            <View>{children}</View>
          </TouchableNativeFeedback>
        </View>
      )
    }

    if (highlight) {
      if (_useRN) {
        return (
          <View style={style}>
            <RNTouchableHighlight
              style={styles.touchable}
              activeOpacity={1}
              underlayColor={_.colorHighLight}
              {...other}
              {...passProps}
            >
              <View />
            </RNTouchableHighlight>
            {children}
          </View>
        )
      }

      return (
        <TouchableHighlight
          style={style}
          activeOpacity={1}
          underlayColor={_.colorHighLight}
          {...other}
          {...passProps}
        >
          <View>{children}</View>
        </TouchableHighlight>
      )
    }

    // 绝大部分情况会return这个
    const Component = _useRN ? RNTouchableOpacity : TouchableOpacity
    return (
      <Component style={style} activeOpacity={0.72} {...other} {...passProps}>
        {children}
      </Component>
    )
  }
)
