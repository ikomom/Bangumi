/*
 * @Author: czy0729
 * @Date: 2019-03-23 04:30:59
 * @Last Modified by: czy0729
 * @Last Modified time: 2022-08-26 10:25:50
 */
import React from 'react'
import { Flex, Text, Touchable, Iconfont, Heatmap } from '@components'
import { Cover as CompCover, IconTouchable } from '@_'
import { _, systemStore } from '@stores'
import { memo } from '@utils/decorators'
import { t } from '@utils/fetch'
import { IMG_DEFAULT } from '@constants'
import { COVER_WIDTH, COVER_HEIGHT, DEFAULT_PROPS } from './ds'

export default memo(
  ({
    navigation,
    styles,
    showRelation,
    size,
    subjectId,
    subjectPrev,
    subjectAfter,
    subjectSeries,
    subjectAnime
  }) => {
    global.rerender('Subject.Series.Main')

    if (subjectPrev || subjectAfter || subjectAnime) {
      return (
        <Flex style={showRelation && styles.relation}>
          <Flex.Item>
            {showRelation && (
              <Flex>
                <Iconfont name='md-subdirectory-arrow-right' size={16} />
                {!!subjectPrev && (
                  <Touchable
                    style={styles.touch}
                    onPress={() => {
                      t('条目.跳转', {
                        to: 'Subject',
                        from: '系列前传',
                        subjectId
                      })

                      navigation.push('Subject', {
                        subjectId: subjectPrev.id,
                        _jp: subjectPrev.title,
                        _image: subjectPrev.image
                      })
                    }}
                  >
                    <Flex>
                      <CompCover
                        style={styles.cover}
                        src={subjectPrev.image || IMG_DEFAULT}
                        size={COVER_WIDTH}
                        height={COVER_HEIGHT}
                        radius={_.radiusSm}
                        placeholder={false}
                        fadeDuration={0}
                        noDefault
                      />
                      <Text style={_.ml.sm} size={11}>
                        前传
                      </Text>
                    </Flex>
                    <Heatmap id='条目.跳转' from='系列前传' />
                  </Touchable>
                )}
                {!!subjectAfter && (
                  <Touchable
                    style={styles.touch}
                    onPress={() => {
                      t('条目.跳转', {
                        to: 'Subject',
                        from: '系列续集',
                        subjectId
                      })

                      navigation.push('Subject', {
                        subjectId: subjectAfter.id,
                        _jp: subjectAfter.title,
                        _image: subjectAfter.image
                      })
                    }}
                  >
                    <Flex>
                      <CompCover
                        style={styles.cover}
                        src={subjectAfter.image || IMG_DEFAULT}
                        size={COVER_WIDTH}
                        height={COVER_HEIGHT}
                        radius={_.radiusSm}
                        placeholder={false}
                        fadeDuration={0}
                        noDefault
                      />
                      <Text style={_.ml.sm} size={11}>
                        续集
                      </Text>
                    </Flex>
                    <Heatmap right={-19} id='条目.跳转' from='系列续集' />
                  </Touchable>
                )}
                {!!subjectAnime && (
                  <Touchable
                    style={styles.touch}
                    onPress={() => {
                      t('条目.跳转', {
                        to: 'Subject',
                        from: '动画化',
                        subjectId
                      })

                      navigation.push('Subject', {
                        subjectId: subjectAnime.id,
                        _jp: subjectAnime.title,
                        _image: subjectAnime.image
                      })
                    }}
                  >
                    <Flex>
                      <CompCover
                        style={styles.cover}
                        src={subjectAnime.image || IMG_DEFAULT}
                        size={COVER_WIDTH}
                        height={COVER_HEIGHT}
                        radius={_.radiusSm}
                        placeholder={false}
                        fadeDuration={0}
                        noDefault
                      />
                      <Text style={_.ml.sm} size={11}>
                        动画
                      </Text>
                    </Flex>
                    <Heatmap right={-19} id='条目.跳转' from='动画化' />
                  </Touchable>
                )}
              </Flex>
            )}
          </Flex.Item>
          <IconTouchable
            style={styles.icon}
            name={showRelation ? 'md-keyboard-arrow-up' : 'md-navigate-next'}
            size={24}
            onPress={() => systemStore.switchSetting('showRelation')}
          />
        </Flex>
      )
    }

    return (
      <Touchable
        style={styles.series}
        onPress={() => {
          t('条目.跳转', {
            to: 'Subject',
            from: '系列',
            subjectId
          })

          navigation.push('Subject', {
            subjectId: subjectSeries.id,
            _jp: subjectSeries.title,
            _image: subjectSeries.image
          })
        }}
      >
        <Flex>
          <Text size={13}>⤷</Text>
          <CompCover
            style={[styles.cover, _.ml.sm]}
            src={subjectSeries.image}
            size={COVER_WIDTH}
            height={COVER_HEIGHT}
            radius={_.radiusSm}
            placeholder={false}
            fadeDuration={0}
            noDefault
          />
          <Text style={_.ml.sm} size={size} bold>
            {subjectSeries.title}
          </Text>
        </Flex>
        <Heatmap id='条目.跳转' from='系列' />
      </Touchable>
    )
  },
  DEFAULT_PROPS
)
