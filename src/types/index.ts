/*
 * @Author: czy0729
 * @Date: 2022-05-02 09:56:05
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-05-26 13:20:49
 */
import React from 'react'
import {
  StyleProp,
  ViewStyle as RNViewStyle,
  TextStyle as RNTextStyle,
  ImageStyle as RNImageStyle,
  ColorValue as RNColorValue
} from 'react-native'
import { EventKeys } from '@constants/events'

/** utils */
/** 用于在 vscode 里面注释能直接显示展开的 type */
export type Expand<T> = T extends infer O
  ? {
      [K in keyof O]: O[K]
    }
  : never

/** 取值 */
export type ValueOf<T> = T[keyof T]

/** 取 Model 联合类型 */
export type ModelValueOf<T extends readonly any[], K extends string> = T[number][K]

/** constants */
/** 路由对象 */
export type Navigation = {
  push?: (path: string, params?: object) => any
  navigate?: (arg0?: any) => any
  goBack?: (arg0?: any) => any
  getRootState?: (arg0?: any) => any
  setOptions?: (params?: object) => any
}

/** <View> StyleProp */
export type ViewStyle = StyleProp<RNViewStyle>

/** <Text> StyleProp */
export type TextStyle = StyleProp<RNTextStyle>

/** <Image> StyleProp */
export type ImageStyle = StyleProp<RNImageStyle>

/** React.ReactNode */
export type ReactNode = React.ReactNode

/** RNColorValue */
export type ColorValue = RNColorValue

/** 埋点对象 */
export type EventType = {
  id?: EventKeys
  data?: {
    [key: string]: string | number | boolean
  }
}

/** 图片 uri */
export type Source =
  | string
  | number
  | {
      uri?: string
      headers?: {
        [key: string]: string
      }
    }

/** 统一列表对象 */
export type ListEmpty<T> = {
  list: T[]
  pagination?: {
    page?: number
    pageTotal?: number
  }
  _list?: T[]
  _loaded?: boolean | number
}

/** 任意函数 */
export type Fn = (arg?: any, arg2?: any) => any

/** App */

/** 任意 ID */
export type Id = number | string

/** 条目 ID */
export type SubjectId = Id

/** 章节 ID */
export type EpId = Id

/** 用户 ID */
export type UserId = Id

/** 真实人物 ID */
export type PersonId = `person/${Id}`

/** 虚拟角色 ID */
export type CharacterId = `character/${Id}`

/** 人物 ID */
export type MonoId = CharacterId | PersonId

/** 帖子 ID */
export type TopicId = `${'group' | 'subject' | 'ep' | 'prsn'}/${Id}`