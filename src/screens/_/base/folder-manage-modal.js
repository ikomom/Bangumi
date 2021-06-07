/*
 * @Author: czy0729
 * @Date: 2021-05-27 14:20:46
 * @Last Modified by: czy0729
 * @Last Modified time: 2021-06-07 08:00:50
 */
import React from 'react'
import { Alert, BackHandler, ScrollView, View } from 'react-native'
import { computed } from 'mobx'
import { Touchable, Flex, Text, Iconfont, Input } from '@components'
import Modal from '@components/@/ant-design/modal'
import TextareaItem from '@ant-design/react-native/lib/textarea-item'
import { _, userStore, usersStore, discoveryStore } from '@stores'
import { getTimestamp, setStorage, getStorage } from '@utils'
import { ob } from '@utils/decorators'
import { queue, t } from '@utils/fetch'
import { info, feedback } from '@utils/ui'
import { IMG_WIDTH, IMG_HEIGHT } from '@constants'
import { Cover } from './cover'
import { Popover } from './popover'
import { IconTouchable } from '../icon/touchable'

const storageKey = 'FolderManageModal|expand'
const width = parseInt(IMG_WIDTH / 1.6)
const height = parseInt(IMG_HEIGHT / 1.6)
const controlDS = {
  root: ['修改', '删除'],
  single: ['修改', '移出'],
  top: ['修改', '下移', '置底', '移出'],
  middle: ['修改', '置顶', '上移', '下移', '置底', '移出'],
  bottom: ['修改', '置顶', '上移', '移出']
}

let loaded = false

export const FolderManageModal = ob(
  class extends React.Component {
    static defaultProps = {
      id: 0,
      visible: false,
      title: '目录',
      onSubmit: Function.prototype,
      onClose: Function.prototype
    }

    state = {
      visible: false,
      expand: [],

      // 新建目录, 目录编辑
      create: false,
      title: '',
      desc: '',

      // 条目编辑
      edit: 0,
      content: '',
      order: '0'
    }

    formhash

    async componentDidMount() {
      const expand = await getStorage(storageKey)
      if (Array.isArray(expand)) {
        this.setState({
          expand
        })
      }

      BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid)
    }

    async UNSAFE_componentWillReceiveProps(nextProps) {
      const { visible } = nextProps
      if (visible) {
        this.fetchCatalogs()
      }

      this.setState({
        visible
      })
    }

    componentWillUnmount() {
      this.setState({
        visible: false
      })
      BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid)
    }

    onBackAndroid = () => {
      const { visible, onClose } = this.props
      if (visible) {
        onClose()
        return true
      }
      return false
    }

    /**
     * 请求目录列表
     */
    fetchCatalogs = async () => {
      const res = usersStore.fetchCatalogs(
        {
          isCollect: false
        },
        true
      )

      const { list } = await res
      queue(list.map(item => () => this.fetchCatalogDetail(item.id, !loaded)))
      loaded = true

      return res
    }

    /**
     * 请求目录详情
     */
    fetchCatalogDetail = async (id, refresh) => {
      if (!refresh) {
        const data = discoveryStore.catalogDetail(id)
        const { _loaded } = data
        if (_loaded && getTimestamp() - _loaded <= 300) {
          return true
        }
      }

      await discoveryStore.fetchCatalogDetail({
        id
      })

      // 缓存最新formhash
      const { list } = this.catalogDetail(id)
      if (list && list.length) {
        const { erase } = list[0]
        const formhash = erase?.split('?gh=')[1]
        if (formhash) {
          this.formhash = formhash
        }
      }

      return true
    }

    /**
     * track
     */
    t(value, other = {}) {
      const { id } = this.props
      t('其他.管理目录', {
        subjectId: id,
        value,
        ...other
      })
    }

    /**
     * 目录展开
     */
    onExpand = item => {
      const { expand } = this.state
      this.setState(
        {
          expand: expand.includes(item.id)
            ? expand.filter(i => !(i == item.id))
            : [...expand, item.id],
          edit: 0,
          content: '',
          order: '0'
        },
        () => {
          setStorage(storageKey, this.state.expand)
        }
      )
    }

    /**
     * 添加/移出
     */
    onToggle = (item, detail, isIn) => {
      if (!isIn) {
        discoveryStore.doCatalogAddRelate(
          {
            catalogId: item.id,
            subjectId: this.props.id,
            formhash: this.formhash || userStore.formhash
          },
          () => {
            info('已添加')
            feedback()
            this.fetchCatalogDetail(item.id, true)
            this.t('onToggle:in')
          }
        )
        return
      }

      const { id } = this.props
      const find = detail.list.find(i => i.id == id)
      if (!find || !find.erase) {
        info('目录信息有误, 暂不能把该条目移出目录, 请重新进入页面')
        return
      }

      Alert.alert('警告', '移出会同时删除目录评价, 确定?', [
        {
          text: '取消',
          style: 'cancel'
        },
        {
          text: '确定',
          onPress: () => {
            discoveryStore.doCatalogDeleteRelate(
              {
                erase: find.erase
              },
              () => {
                info('已移出')
                feedback()
                this.fetchCatalogDetail(item.id, true)
                this.t('onToggle:out')
              }
            )
          }
        }
      ])
    }

    /**
     * 更多菜单
     */
    onControl = (title, item) => {
      const detail = this.catalogDetail(item.id)
      switch (title) {
        case '修改':
          this.setState({
            create: item.id,
            title: item.title || '',
            desc: detail.content || ''
          })
          break

        case '删除':
          if (!(this.formhash || userStore.formhash)) {
            info('授权信息有误, 无法操作, 请尝试重新登陆')
            return
          }

          setTimeout(() => {
            Alert.alert(
              '警告',
              `删除目录[${item.title}], 操作将抹掉所有关联数据以及用户留言, 是否要继续?`,
              [
                {
                  text: '取消',
                  style: 'cancel'
                },
                {
                  text: '确定',
                  onPress: () => {
                    discoveryStore.doCatalogDelete(
                      {
                        catalogId: item.id,
                        formhash: this.formhash || userStore.formhash
                      },
                      () => {
                        info('已删除')
                        feedback()
                        this.fetchCatalogs()
                        this.t('onControl:delete')
                      }
                    )
                  }
                }
              ]
            )
          }, 240)
          break

        default:
          break
      }
    }

    /**
     * 创建目录
     */
    onCreate = isNew => {
      if (isNew) {
        if (!(this.formhash || userStore.formhash)) {
          info('授权信息有误, 无法操作, 请尝试重新登陆')
          return
        }

        this.setState({
          create: true
        })
      } else {
        this.setState({
          create: false,
          title: '',
          desc: ''
        })
      }
    }

    /**
     * 提交创建/修改目录
     */
    onSubmitCatalog = () => {
      if (!(this.formhash || userStore.formhash)) {
        info('授权信息有误, 无法操作, 请尝试重新登陆')
        return
      }

      const { create, title, desc } = this.state
      if (!title.length) {
        info('请填写目录标题')
        return
      }

      if (!desc.length) {
        info('请填写目录介绍')
        return
      }

      if (create === true) {
        discoveryStore.doCatalogCreate(
          {
            formhash: this.formhash || userStore.formhash,
            title: title || '',
            desc: desc || ''
          },
          () => {
            info('已创建')
            this.fetchCatalogs()
            this.onCreate(false)
            feedback()
            this.t('onSubmitCatalog:create')
          }
        )
        return
      }

      discoveryStore.doCatalogEdit(
        {
          catalogId: create,
          formhash: this.formhash || userStore.formhash,
          title: title || '',
          desc: desc || ''
        },
        () => {
          this.fetchCatalogDetail(create)
          this.onCreate(false)
          feedback()
          this.t('onSubmitCatalog:edit')
        }
      )
    }

    /**
     * 条目更多菜单
     */
    onSubjectControl = (title, item, pItem) => {
      const detail = this.catalogDetail(pItem.id)
      const current = fixedOrder(item.order)
      let order = 0
      let temp
      let flag

      switch (title) {
        case '置顶':
          temp = detail.list.sort((a, b) => Number(a.sort) - Number(b.sort))[0]
          order = Number(temp.order)
          if (Number.isNaN(order)) {
            order = 0
          } else {
            order -= 10
          }

          this.onSort(item, order, pItem)
          this.t('onSubjectControl:top')
          break

        case '上移':
          if (current == 0) {
            order = -10
          } else {
            temp = detail.list
              .map(i => fixedOrder(i.order))
              .sort((a, b) => b - a)
            temp.forEach(i => {
              if (!flag && current > i) {
                order = i - 10
                flag = true
              }
            })

            if (!flag) {
              order = (temp[temp.length - 1] || 0) - 10
            }
          }

          this.onSort(item, order, pItem)
          this.t('onSubjectControl:up')
          break

        case '下移':
          detail.list
            .map(i => fixedOrder(i.order))
            .sort((a, b) => a - b)
            .forEach(i => {
              if (!flag && current < i) {
                order = i + 10
                flag = true
              }
            })
          if (!flag) {
            order = current + 10
          }

          this.onSort(item, order, pItem)
          this.t('onSubjectControl:down')
          break

        case '置底':
          temp = detail.list.sort((a, b) => Number(b.sort) - Number(a.sort))[0]
          order = Number(temp.order)
          if (Number.isNaN(order)) {
            order = 10
          } else {
            order += 10
          }

          this.onSort(item, order, pItem)
          this.t('onSubjectControl:bottom')
          break

        case '修改':
          this.onSubjectEdit(item)
          this.t('onSubjectControl:edit')
          break

        case '移出':
          setTimeout(() => {
            Alert.alert('警告', '确定移出目录?', [
              {
                text: '取消',
                style: 'cancel'
              },
              {
                text: '确定',
                onPress: () => {
                  discoveryStore.doCatalogDeleteRelate(
                    {
                      erase: item.erase
                    },
                    () => {
                      info('已移出')
                      feedback()
                      this.fetchCatalogDetail(pItem.id, true)
                      this.t('onSubjectControl:remove')
                    }
                  )
                }
              }
            ])
          }, 240)
          break

        default:
          break
      }
    }

    /**
     * 编辑项
     */
    onSubjectEdit = item => {
      if (item) {
        this.setState({
          edit: item.id,
          content: item.comment || '',
          order: item.order || '0'
        })
        return
      }

      this.setState({
        edit: 0,
        content: '',
        order: '0'
      })
    }

    /**
     * 改变文字
     */
    onChange = (value, key = 'content') => {
      this.setState({
        [key]: value
      })
    }

    /**
     * 改变排序
     */
    onOrder = order => {
      if (!order) {
        this.setState({
          order: ''
        })
        return
      }

      const _order = Number(order)
      if (Number.isNaN(_order)) {
        return
      }

      this.setState({
        order: _order == 0 ? '' : _order
      })
    }

    /**
     * 直接提交顺序
     */
    onSort = (item, order, pItem) => {
      const { modify, erase } = item
      const formhash = erase?.split('?gh=')[1]
      if (!formhash) {
        info('目录信息有误, 暂不能修改条目, 请重新进入页面')
        return
      }

      discoveryStore.doCatalogModifySubject(
        {
          modify,
          formhash,
          content: item.comment || '',
          order: order || '0'
        },
        () => {
          feedback()
          this.fetchCatalogDetail(pItem.id, true)
        }
      )
    }

    /**
     * 提交
     */
    onSubmit = (item, pItem) => {
      const { modify, erase } = item
      const { content, order } = this.state
      const formhash = erase?.split('?gh=')[1]
      if (!formhash) {
        info('目录信息有误, 暂不能修改条目, 请重新进入页面')
        return
      }

      discoveryStore.doCatalogModifySubject(
        {
          modify,
          formhash,
          content: content || '',
          order: order || '0'
        },
        () => {
          feedback()
          this.fetchCatalogDetail(pItem.id, true)
          this.onSubjectEdit()
          this.t('onSubmit:subject')
        }
      )
    }

    @computed get catalogs() {
      return usersStore.catalogs()
    }

    catalogDetail(id) {
      return computed(() => discoveryStore.catalogDetail(id)).get()
    }

    renderBtnCreate() {
      const { edit, create } = this.state
      if (edit || create) {
        return null
      }

      return (
        <IconTouchable
          style={this.styles.btnCreate}
          name='md-add'
          size={24}
          color={_.colorSub}
          onPress={() => this.onCreate(true)}
        />
      )
    }

    renderCreate() {
      const { create, title, desc } = this.state
      if (create !== true) {
        return null
      }

      return (
        <View style={this.styles.create}>
          <Text bold>新建目录</Text>
          <Input
            style={[this.styles.textarea, _.mt.md]}
            defaultValue={title}
            placeholder='输入标题'
            clear
            onChangeText={text => this.onChange(text, 'title')}
          />
          <TextareaItem
            style={[this.styles.textarea, _.mt.md]}
            value={desc}
            placeholder='输入介绍'
            placeholderTextColor={_.colorDisabled}
            rows={3}
            selectionColor={_.colorMain}
            clear
            onChange={text => this.onChange(text, 'desc')}
          />
          <IconTouchable
            style={this.styles.btnCreateCancel}
            name='md-close'
            size={22}
            color={_.colorSub}
            onPress={() => this.onCreate(false)}
          />
          <IconTouchable
            style={this.styles.btnCreateSubmit}
            name='md-check'
            size={22}
            color={_.colorSub}
            onPress={this.onSubmitCatalog}
          />
        </View>
      )
    }

    renderList() {
      const { create } = this.state
      const { list } = this.catalogs
      return (
        <ScrollView style={this.styles.scrollView}>
          {create === true
            ? this.renderCreate()
            : list
                .sort((a, b) => {
                  const { id } = this.props
                  const detailA = this.catalogDetail(a.id)
                  const detailB = this.catalogDetail(b.id)
                  const isInA = detailA?.list?.some(i => i.id == id)
                  const isInB = detailB?.list?.some(i => i.id == id)
                  if (isInA && isInB) return b.time.localeCompare(a.time)
                  if (isInA && !isInB) return -1
                  return 1
                })
                .map(item => {
                  const detail = this.catalogDetail(item.id)
                  return (
                    <View key={item.id}>
                      {this.renderCatalog(item, detail)}
                      {this.renderSubjects(item, detail)}
                    </View>
                  )
                })}
        </ScrollView>
      )
    }

    renderCatalog(item, detail) {
      const { id } = this.props
      const { expand, create, edit } = this.state
      const isIn = detail?.list?.some(i => i.id == id)
      const date = item.time?.split(' ')[0]?.replace('创建于:', '') || ''
      return (
        <Flex style={this.styles.catalog}>
          <Flex.Item>
            {create == item.id ? (
              <View style={_.mb.sm}>
                <Text bold>编辑目录</Text>
                <Input
                  style={[this.styles.textarea, _.mt.md]}
                  defaultValue={item.title}
                  placeholder='输入标题'
                  clear
                  onChangeText={text => this.onChange(text, 'title')}
                />
                <TextareaItem
                  style={[this.styles.textarea, _.mt.md]}
                  value={detail.content}
                  placeholder='输入介绍'
                  placeholderTextColor={_.colorDisabled}
                  rows={3}
                  selectionColor={_.colorMain}
                  clear
                  onChange={text => this.onChange(text, 'desc')}
                />
              </View>
            ) : (
              <Touchable onPress={() => this.onExpand(item)}>
                <Flex>
                  <Text bold>
                    {item.title} ({detail.list.length})
                  </Text>
                  <Iconfont
                    name={
                      expand.includes(item.id)
                        ? 'md-keyboard-arrow-down'
                        : 'md-navigate-next'
                    }
                    size={22}
                    lineHeight={24}
                  />
                </Flex>
                <Text style={_.mt.xs} size={11} type='sub' numberOfLines={1}>
                  {date} / {detail.content}
                </Text>
              </Touchable>
            )}
          </Flex.Item>
          <Flex style={this.styles.control} justify='end'>
            {!edit && !create && (
              <>
                <IconTouchable
                  style={_.ml.sm}
                  name={isIn ? 'md-star' : 'md-star-outline'}
                  size={18}
                  color={isIn ? _.colorWarning : _.colorSub}
                  onPress={() => this.onToggle(item, detail, isIn)}
                />
                <Popover
                  style={this.styles.btnPopover}
                  data={controlDS.root}
                  onSelect={title => this.onControl(title, item)}
                >
                  <Flex style={this.styles.touch} justify='center'>
                    <Iconfont
                      name='md-more-vert'
                      size={18}
                      color={_.colorSub}
                    />
                  </Flex>
                </Popover>
              </>
            )}
            {item.id == create && (
              <>
                <IconTouchable
                  style={this.styles.btnCreateCancel}
                  name='md-close'
                  size={22}
                  color={_.colorSub}
                  onPress={() => this.onCreate(false)}
                />
                <IconTouchable
                  style={this.styles.btnCreateSubmit}
                  name='md-check'
                  size={22}
                  color={_.colorSub}
                  onPress={this.onSubmitCatalog}
                />
              </>
            )}
          </Flex>
        </Flex>
      )
    }

    renderSubjects(item, detail) {
      const { id } = this.props
      const { expand, create, edit, content, order } = this.state
      if (!(expand.includes(item.id) || create == item.id)) {
        return null
      }

      return (
        <View style={this.styles.subjects}>
          {detail.list.map((i, index) => {
            const isEditing = !!edit && edit == i.id
            const { length } = detail.list
            let data
            if (length <= 1) {
              data = controlDS.single
            } else if (index === 0) {
              data = controlDS.top
            } else if (index === length - 1) {
              data = controlDS.bottom
            } else {
              data = controlDS.middle
            }

            const align = isEditing || i.comment ? 'start' : 'center'
            return (
              <Flex style={this.styles.subject} align={align}>
                <Cover
                  src={i.image}
                  size={width}
                  height={height}
                  radius
                  type={i.type}
                />
                <Flex.Item style={_.ml.sm}>
                  <Text
                    size={11}
                    type={i.id == id ? 'warning' : 'desc'}
                    bold
                    numberOfLines={1}
                  >
                    {i.title}
                  </Text>
                  <Text style={_.mt.xs} size={10} type='sub' numberOfLines={2}>
                    [{i.order}] {i.info}
                  </Text>
                  {!isEditing && !!i.comment && (
                    <Text style={this.styles.comment} size={10}>
                      {i.comment}
                    </Text>
                  )}
                  {isEditing && (
                    <>
                      <TextareaItem
                        style={this.styles.textarea}
                        value={content}
                        placeholder='输入评价'
                        placeholderTextColor={_.colorDisabled}
                        rows={3}
                        selectionColor={_.colorMain}
                        clear
                        onChange={this.onChange}
                      />
                      <Input
                        style={[this.styles.textarea, _.mt.md]}
                        defaultValue={order == '0' ? '' : order}
                        keyboardType='number-pad'
                        placeholder='输入排序 (越小越前)'
                        onChangeText={this.onOrder}
                      />
                    </>
                  )}
                </Flex.Item>
                <Flex style={this.styles.control} justify='end'>
                  {isEditing && (
                    <View style={this.styles.editWrap}>
                      <IconTouchable
                        name='md-close'
                        size={18}
                        color={_.colorSub}
                        onPress={() => this.onSubjectEdit()}
                      />
                      <IconTouchable
                        style={this.styles.btnSubmit}
                        name='md-check'
                        size={18}
                        color={_.colorSub}
                        onPress={() => this.onSubmit(i, detail)}
                      />
                    </View>
                  )}
                  {!edit && !create && (
                    <Popover
                      style={this.styles.btnPopover}
                      data={data}
                      onSelect={title => this.onSubjectControl(title, i, item)}
                    >
                      <Flex style={this.styles.touch} justify='center'>
                        <Iconfont
                          name='md-more-vert'
                          size={18}
                          color={_.colorSub}
                        />
                      </Flex>
                    </Popover>
                  )}
                </Flex>
              </Flex>
            )
          })}
        </View>
      )
    }

    render() {
      const { title, onClose } = this.props
      const { visible } = this.state
      return (
        <Modal
          style={this.styles.modal}
          visible={visible}
          title={
            <Text type='title' size={16}>
              {title}
            </Text>
          }
          transparent
          maskClosable
          closable
          onClose={onClose}
        >
          {this.renderBtnCreate()}
          {this.renderList()}
        </Modal>
      )
    }

    get styles() {
      return memoStyles()
    }
  }
)

const memoStyles = _.memoStyles(_ => ({
  modal: {
    width: _.window.width - 2 * _.wind,
    maxWidth: 400,
    backgroundColor: _.select(_.colorBg, _.colorBg)
  },
  scrollView: {
    height: _.window.height * 0.64,
    marginTop: _.md
  },
  catalog: {
    padding: _.sm,
    paddingRight: 0,
    marginBottom: _.sm
  },
  control: {
    minWidth: 48,
    height: '100%'
  },
  subjects: {
    paddingLeft: _.sm,
    paddingBottom: _.sm,
    marginTop: -_.sm
  },
  subject: {
    paddingVertical: _.sm
  },
  comment: {
    padding: _.sm,
    marginTop: _.sm,
    backgroundColor: _.select(_.colorBg, _._colorDarkModeLevel1),
    borderWidth: 1,
    borderColor: _.select(_.colorIcon, _.colorBorder),
    borderRadius: _.radiusXs,
    overflow: 'hidden'
  },
  textarea: {
    padding: _.sm,
    marginTop: _.sm,
    marginBottom: -4,
    color: _.colorDesc,
    ..._.fontSize10,
    backgroundColor: _.select(_.colorPlain, _._colorDarkModeLevel1),
    borderWidth: 1,
    borderColor: _.select(_.colorIcon, _.colorBorder),
    borderRadius: _.radiusXs,
    overflow: 'hidden'
  },
  editWrap: {
    height: '100%'
  },
  create: {
    paddingTop: _.sm,
    paddingRight: 48,
    paddingLeft: _.sm,
    marginBottom: _.md
  },
  btnPopover: {
    marginLeft: _.sm,
    marginRight: -2,
    borderRadius: 20,
    overflow: 'hidden'
  },
  touch: {
    width: 38,
    height: 38
  },
  btnCreate: {
    position: 'absolute',
    zIndex: 1,
    top: -31,
    right: 12
  },
  btnCreateCancel: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: -4
  },
  btnSubmit: {
    position: 'absolute',
    zIndex: 1,
    right: 0,
    bottom: -4
  },
  btnCreateSubmit: {
    position: 'absolute',
    zIndex: 1,
    right: -4,
    bottom: -4
  }
}))

function fixedOrder(order) {
  const _order = Number(order)
  return Number.isNaN(_order) ? 10 : _order
}
