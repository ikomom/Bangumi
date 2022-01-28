/*
 * 带标签的回复框
 * @Author: czy0729
 * @Date: 2019-06-10 22:24:08
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-01-28 15:17:28
 */
import React from 'react'
import { ScrollView, View, TouchableWithoutFeedback } from 'react-native'
import { observer } from 'mobx-react'
import TextareaItem from '@ant-design/react-native/lib/textarea-item'
import { _ } from '@stores'
import { getStorage, setStorage, open } from '@utils'
import { IOS, HOST_IMAGE_UPLOAD } from '@constants'
import { Text } from './text'
import { Bgm } from './bgm'
import { Flex } from './flex'
import { Iconfont } from './iconfont'
import { KeyboardSpacer } from './keyboard-spacer'
import { Touchable } from './touchable'

const namespace = 'c-fixed-textarea'
const maxHistoryCount = 7 // 最大常用bgm表情数量
const sourceFlag = '来自Bangumi for'
const sourceText = `\n[color=grey][size=10][${sourceFlag} ${
  IOS ? 'iOS' : 'android'
}] [url=https://bgm.tv/group/topic/350677][color=grey]获取[/color][/url][/size][/color]`

export const FixedTextarea = observer(
  class extends React.Component {
    static defaultProps = {
      value: '',
      placeholder: '',
      simple: false,
      source: false,
      onClose: Function.prototype,
      onChange: Function.prototype,
      onSubmit: Function.prototype // value => {}
    }

    state = {
      value: this.props.value,
      showTextarea: false,
      showBgm: false,
      showReplyHistory: false,
      showKeyboardSpacer: false,
      showSource: false,
      keyboardHeight: 0,
      history: [],
      replyHistory: []
    }

    ref
    selection = {
      start: this.props.value.length,
      end: this.props.value.length
    }

    async componentDidMount() {
      try {
        const showSource = (await getStorage(`${namespace}|showSource`)) || false
        const history = (await getStorage(namespace)) || '15' // 15就是bgm38
        const bgmHistory = history
          .split(',')
          .filter(item => item !== '')
          .map(item => parseInt(item))
        const replyHistory = (await getStorage(`${namespace}|replyHistory`)) || []

        this.setState({
          showSource,
          history: bgmHistory,
          replyHistory
        })
      } catch (error) {
        warn('fixed-textarea', 'componentDidMount', error)
      }
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
      const { value } = nextProps
      if (value !== this.state.value) {
        this.setState({
          value
        })
      }
    }

    connectRef = ref => (this.ref = ref)

    onRefBlur = () => {
      try {
        const ref = this.ref.textAreaRef
        ref.blur()
      } catch (error) {}
    }

    onToggle = (open, keyboardHeight) => {
      if (open) {
        this.setState({
          showKeyboardSpacer: true,
          keyboardHeight
        })
      }
    }

    onFocus = () => {
      this.setState({
        showTextarea: true,
        showBgm: false,
        showReplyHistory: false
      })

      setTimeout(() => {
        this.ref.textAreaRef.focus()
      }, 0)
    }

    onBlur = () => {
      const { onClose } = this.props
      onClose()

      this.setState({
        showTextarea: false,
        showBgm: false,
        showReplyHistory: false,
        showKeyboardSpacer: false
      })

      setTimeout(() => {
        this.onRefBlur()
      }, 0)
    }

    onChange = value => {
      const { onChange } = this.props
      onChange(value)

      // 安卓设置过光标后, 继续打字光标会闪回到上次设置的地方, 需要重置
      try {
        if (!IOS) {
          this.ref.textAreaRef.setNativeProps({
            selection: {}
          })
        }
      } catch (error) {}

      this.setState({
        value
      })
    }

    onSelectionChange = event => {
      const { nativeEvent } = event
      this.selection = nativeEvent.selection
    }

    // @todo 暂时没有对选择了一段文字的情况做判断
    onAddSymbolText = symbol => {
      const ref = this.ref.textAreaRef
      ref.focus()

      const { value } = this.state
      const index = this.getSelection()

      // 插入值, 如[s]光标位置[/s], [url=光标位置]链接描述[/url]
      let left
      let right
      if (symbol === 'url') {
        left = `${value.slice(0, index)}[url=`
        right = `]链接描述[/url]${value.slice(index)}`
      } else {
        left = `${value.slice(0, index)}[${symbol}]`
        right = `[/${symbol}]${value.slice(index)}`
      }

      this.setState({
        value: `${left}${right}`
      })
      this.setSelection(left.length)
    }

    // 选择bgm表情
    onSelectBgm = bgmIndex => {
      const { value } = this.state
      const index = this.getSelection()

      // 插入值, 如(bgm38), bgm名称跟文件名偏移量是23
      const left = `${value.slice(0, index)}(bgm${parseInt(bgmIndex) + 23})`
      const right = `${value.slice(index)}`
      this.setState({
        value: `${left}${right}`
      })
      this.setSelection(left.length)
      this.setRecentUseBgm(bgmIndex)
    }

    // 提交 (完了要保存历史)
    onSubmit = () => {
      const { value } = this.state
      if (value === '') return

      const { onSubmit } = this.props
      onSubmit(this.value)
      this.setReplyHistory(value)

      this.clear()
      this.onBlur()
    }

    clear = () => {
      const { onClose } = this.props
      onClose()

      this.setState({
        value: '',
        showTextarea: false
      })
    }

    // 获取光标位置
    getSelection = () => {
      // 失效?
      // const ref = this.ref.textAreaRef
      // const selection = ref._lastNativeSelection || null
      // const { value } = this.state
      // let index = value.length
      // if (selection) {
      //   index = selection.start
      // }
      // return index

      return this.selection.end
    }

    // 设定光标位置
    setSelection = start => {
      const { textAreaRef } = this.ref
      setTimeout(() => {
        const selection = {
          start,
          end: start
        }

        textAreaRef.setNativeProps({
          selection
        })
        this.selection = selection
      }, 0)
    }

    showBgm = () => {
      // 安卓eject后, 键盘表现跟IOS不一致, 特殊处理
      if (IOS) {
        this.setState({
          showBgm: true,
          showReplyHistory: false
        })

        setTimeout(() => {
          this.onRefBlur()
        }, 0)
        return
      }

      setTimeout(() => {
        this.onRefBlur()

        setTimeout(() => {
          this.setState({
            showBgm: true,
            showReplyHistory: false
          })
        }, 0)
      }, 0)
    }

    hideBgm = () => {
      this.setState({
        showBgm: false
      })

      setTimeout(() => {
        const ref = this.ref.textAreaRef
        ref.focus()
      }, 0)
    }

    // 本地化最近使用bgm
    setRecentUseBgm = async bgmIndex => {
      let history = [...this.state.history]
      if (history.includes(bgmIndex)) {
        history = history.filter(item => item !== bgmIndex)
        history.unshift(bgmIndex)
      } else {
        history.unshift(bgmIndex)
      }
      if (history.length > maxHistoryCount) {
        history = history.filter((item, index) => index < maxHistoryCount)
      }

      this.setState({
        history
      })
      setStorage(namespace, history.join())
    }

    // 本地化最近的回复
    setReplyHistory = async value => {
      let replyHistory = [...this.state.replyHistory]
      if (replyHistory.includes(value)) {
        replyHistory = replyHistory.filter(item => item !== value)
        replyHistory.unshift(value)
      } else {
        replyHistory.unshift(value)
      }
      if (replyHistory.length > maxHistoryCount) {
        replyHistory = replyHistory.filter((item, index) => index < maxHistoryCount)
      }

      this.setState({
        replyHistory
      })
      setStorage(`${namespace}|replyHistory`, replyHistory)
    }

    showReplyHistory = () => {
      // 安卓eject后, 键盘表现跟IOS不一致, 特殊处理
      if (IOS) {
        this.setState({
          showReplyHistory: true,
          showBgm: true
        })

        setTimeout(() => {
          this.onRefBlur()
        }, 0)
        return
      }

      setTimeout(() => {
        this.onRefBlur()

        setTimeout(() => {
          this.setState({
            showReplyHistory: true,
            showBgm: true
          })
        }, 0)
      }, 0)
    }

    hideReplyHistory = () => {
      this.setState({
        showReplyHistory: false
      })

      setTimeout(() => {
        const ref = this.ref.textAreaRef
        ref.focus()
      }, 0)
    }

    toggleSource = () => {
      const { showSource } = this.state
      const newShowSource = !showSource
      this.setState({
        showSource: newShowSource
      })
      setStorage(`${namespace}|showSource`, newShowSource)
    }

    get value() {
      const { source } = this.props
      const { value, showSource } = this.state
      if (!source || !showSource || value.includes(sourceFlag)) return value
      return `${value}${sourceText}`
    }

    renderBtn(text, symbol) {
      const size = _.window.width < 375 ? 10 : 11
      if (text === 'BGM') {
        const { showBgm, showReplyHistory } = this.state
        return (
          <Touchable
            style={this.styles.toolBarBtn}
            onPress={() => {
              if (showBgm) {
                this.hideBgm()
              } else {
                this.showBgm()
              }
            }}
          >
            <Text type={showBgm && !showReplyHistory ? 'main' : 'sub'} size={size}>
              {text}
            </Text>
          </Touchable>
        )
      }

      if (text === '历史') {
        const { showReplyHistory } = this.state
        return (
          <Touchable
            style={this.styles.toolBarBtn}
            onPress={() => {
              if (showReplyHistory) {
                this.hideReplyHistory()
              } else {
                this.showReplyHistory()
              }
            }}
          >
            <Text type={showReplyHistory ? 'main' : 'sub'} size={size} align='center'>
              {text}
            </Text>
          </Touchable>
        )
      }

      const isOpenInNew = text === '图床'
      return (
        <Touchable
          style={this.styles.toolBarBtn}
          onPress={() => {
            if (isOpenInNew) {
              open(HOST_IMAGE_UPLOAD)
            } else {
              this.onAddSymbolText(symbol)
            }
          }}
        >
          <Flex>
            <Text type='sub' size={size} align='center'>
              {text}
            </Text>
            {isOpenInNew && (
              <Iconfont style={_.ml.xxs} name='md-open-in-new' size={size + 1} />
            )}
          </Flex>
        </Touchable>
      )
    }

    renderToolBar() {
      const { showTextarea, showBgm } = this.state
      if (!(showTextarea || showBgm)) return null

      const { simple } = this.props
      return (
        <Flex
          style={this.styles.toolBar}
          wrap='wrap'
          justify={simple ? undefined : 'between'}
        >
          {this.renderBtn('BGM')}
          {!simple && (
            <>
              {this.renderBtn('加粗', 'b')}
              {this.renderBtn('斜体', 'i')}
              {this.renderBtn('下划', 'u')}
              {this.renderBtn('删除', 's')}
              {this.renderBtn('剧透', 'mask')}
              {this.renderBtn('链接', 'url')}
              {this.renderBtn('图片', 'img')}
              {this.renderBtn('图床', 'imgchr')}
            </>
          )}
          {this.renderBtn('历史')}
        </Flex>
      )
    }

    renderSource() {
      const { source } = this.props
      const { showTextarea, showSource } = this.state
      if (!source || !showTextarea) return null

      return (
        <Flex style={this.styles.source}>
          <Flex.Item>
            {showSource && (
              <Text style={this.styles.opacity} size={10} type='sub'>
                [来自Bangumi for {IOS ? 'iOS' : 'android'}]
              </Text>
            )}
          </Flex.Item>
          <Touchable style={this.styles.touchSource} onPress={this.toggleSource}>
            <Flex>
              <Iconfont
                name={showSource ? 'md-check-circle' : 'md-radio-button-off'}
                size={11}
                color={showSource ? _.colorMain : _.colorSub}
              />
              <Text style={_.ml.xs} type='sub' size={11}>
                宣传语
              </Text>
            </Flex>
          </Touchable>
        </Flex>
      )
    }

    renderTextarea() {
      const { placeholder } = this.props
      const { value, showTextarea, showBgm } = this.state
      const canSend = value !== ''
      return (
        <View style={this.styles.textareaContainer}>
          <Flex align='start'>
            <Flex.Item>
              <TextareaItem
                ref={this.connectRef}
                style={this.styles.textarea}
                value={value}
                placeholder={placeholder || '我要吐槽'}
                placeholderTextColor={_.colorDisabled}
                rows={showTextarea || showBgm ? 6 : 1}
                selectionColor={_.colorMain}
                clear
                onFocus={this.onFocus}
                onChange={this.onChange}
                onSelectionChange={this.onSelectionChange}
              />
              <View style={this.styles.fixedTextareaBorderBottom} />
            </Flex.Item>
            <Touchable style={this.styles.touchSend} onPress={this.onSubmit}>
              <Flex style={this.styles.send} justify='center'>
                <Iconfont
                  name='md-send'
                  size={18}
                  color={canSend ? _.colorMain : _.colorIcon}
                />
              </Flex>
            </Touchable>
            {this.renderSource()}
          </Flex>
        </View>
      )
    }

    renderContent() {
      const {
        showTextarea,
        showBgm,
        showReplyHistory,
        keyboardHeight,
        history,
        replyHistory
      } = this.state
      // 安卓eject后, 键盘表现跟IOS不一致, 特殊处理
      if (!IOS && !showBgm) return null
      if (!showTextarea || !keyboardHeight) return null

      return (
        <ScrollView
          style={{
            height: keyboardHeight + 1
          }}
          contentContainerStyle={this.styles.bgmContainer}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          {showReplyHistory ? (
            <>
              {replyHistory.map((item, index) => (
                <Touchable
                  key={index}
                  style={this.styles.replyHistory}
                  onPress={() => this.onChange(item)}
                >
                  <Text lineHeight={18}>{item}</Text>
                </Touchable>
              ))}
            </>
          ) : (
            <>
              <Text style={_.container.wind} size={12} type='sub'>
                常用
              </Text>
              <Flex style={this.styles.bgms} wrap='wrap'>
                {history.map((item, index) => (
                  <View key={index} style={this.styles.bgm}>
                    <Touchable onPress={() => this.onSelectBgm(item)}>
                      <Flex justify='center'>
                        <Bgm index={item} />
                      </Flex>
                    </Touchable>
                  </View>
                ))}
              </Flex>
              <Text style={[_.container.wind, _.mt.sm]} size={12} type='sub'>
                全部
              </Text>
              <Flex style={this.styles.bgms} wrap='wrap'>
                {Array.from(new Array(100)).map((item, index) => (
                  <View key={index + 1} style={this.styles.bgm}>
                    <Touchable onPress={() => this.onSelectBgm(index + 1)}>
                      <Flex justify='center'>
                        <Bgm index={index + 1} />
                      </Flex>
                    </Touchable>
                  </View>
                ))}
              </Flex>
            </>
          )}
        </ScrollView>
      )
    }

    renderMask() {
      const { showTextarea, showBgm } = this.state
      if (!(showTextarea || showBgm)) return null

      return (
        <View style={this.styles.maskContainer}>
          <TouchableWithoutFeedback onPress={this.onBlur}>
            <View style={this.styles.mask} />
          </TouchableWithoutFeedback>
        </View>
      )
    }

    render() {
      const { children } = this.props
      const { showKeyboardSpacer } = this.state
      return (
        <>
          {this.renderMask()}
          <View style={this.styles.container}>
            {children}
            {this.renderToolBar()}
            {this.renderTextarea()}
            {this.renderContent()}
          </View>
          {!showKeyboardSpacer && (
            <View style={this.styles.hide}>
              <KeyboardSpacer onToggle={this.onToggle} />
            </View>
          )}
        </>
      )
    }

    get styles() {
      return memoStyles()
    }
  }
)

const memoStyles = _.memoStyles(() => ({
  maskContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0
  },
  mask: {
    height: _.window.height
  },
  container: {
    position: 'absolute',
    zIndex: 1001,
    right: 0,
    bottom: 0,
    left: 0,
    paddingTop: 2,
    paddingBottom: _.ios(20, 0),
    backgroundColor: _.select(_.colorPlain, _._colorDarkModeLevel1),
    borderTopWidth: _.select(_.hairlineWidth, 0),
    borderTopColor: _.colorBorder
  },
  toolBar: {
    paddingVertical: _.sm,
    paddingHorizontal: _.wind,
    marginLeft: -_.sm
  },
  toolBarBtn: {
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: _.radiusSm,
    overflow: 'hidden'
  },
  bgmContainer: {
    paddingVertical: _.sm
  },
  bgms: {
    paddingHorizontal: _.wind - _._wind
  },
  bgm: {
    width: _.isLandscape ? '7.14%' : '14.28%',
    paddingVertical: _.md
  },
  replyHistory: {
    paddingHorizontal: _.wind,
    paddingVertical: _.sm
  },
  textareaContainer: {
    paddingHorizontal: _.wind
  },
  textarea: {
    paddingVertical: _.sm,
    paddingHorizontal: 0,
    marginBottom: -_.hairlineWidth,
    color: _.colorDesc,
    fontSize: 14 + _.fontSizeAdjust,
    lineHeight: 22,
    backgroundColor: _.select(_.colorPlain, _._colorDarkModeLevel1)
  },

  // TextareaItem 下方有一根白色线修复不了, 用这个遮着
  fixedTextareaBorderBottom: {
    height: 2,
    marginTop: -1,
    backgroundColor: _.select(_.colorPlain, _._colorDarkModeLevel1)
  },
  touchSend: {
    marginTop: _.ios(8, -1),
    marginLeft: _.sm,
    marginRight: -4,
    borderRadius: 20,
    overflow: 'hidden'
  },
  send: {
    width: 36,
    height: 36,
    marginTop: _.device(0, _.xs)
  },
  touchSource: {
    padding: _.xs,
    marginRight: -_.sm,
    borderRadius: _.radiusSm,
    overflow: 'hidden'
  },
  source: {
    position: 'absolute',
    zIndex: 2,
    right: 4,
    bottom: _.md,
    left: 2
  },
  opacity: {
    opacity: 0.8
  },
  hide: {
    display: 'none'
  }
}))
