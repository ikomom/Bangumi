/*
 * @Author: czy0729
 * @Date: 2022-09-29 06:10:49
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-09-29 06:14:56
 */
import { factory } from '@utils'
import { Fn, Id, Navigation, UserId } from '@types'
import Store from './store'

const f = factory(Store)

export type StoreType = typeof f

export type Ctx = {
  $: StoreType
  navigation?: Navigation
}

export type Params = {
  id?: Id
  userId?: UserId
  onNavigationCallback?: Fn
}
