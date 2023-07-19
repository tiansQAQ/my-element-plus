<template>
  <div ref="scrollbarRef" :class="[ns.b()]">
    <div ref="wrapRef" :class="wrapKls" :style="style" @scroll="handleScroll">
      <component :is="tag" ref="resizeRef" :class="resizeKls" :style="viewStyle">
        <slot />
      </component>
    </div>
    <template v-if="!native">
      <bar ref="barRef" :height="sizeHeight" :width="sizeWidth" :always="always" :ratio-x="ratioX" :ratio-y="ratioY" />
    </template>
  </div>
</template>

<script setup>
import { ref, defineProps, computed, watch, nextTick, onMounted, onUpdated, provide, reactive } from 'vue'
import { useNamespace } from '@/hooks'
import { useResizeObserver, useEventListener } from '@vueuse/core'
import { addUnit } from '@/utils'
import { scrollbarContextKey } from './constants'

import Bar from './bar.vue'

const GAP = 0 // top 2 + bottom 2 of bar instance
const COMPONENT_NAME = 'ElScrollbar'

defineOptions({ name: COMPONENT_NAME })
const props = defineProps({
  // wrap-class
  wrapClass: {
    type: [String, Array],
    default: ''
  },

  // 包裹容器的自定义样式
  wrapStyle: {
    type: [String, Object, Array],
    default: ''
  },
  // 视图的自定义类名
  viewClass: {
    type: [String, Array],
    default: ''
  },
  // 视图的自定义样式
  viewStyle: {
    type: [String, Array, Object],
    default: ''
  },
  // 是否使用原生滚动条样式
  native: Boolean,
  // 元素标签
  tag: {
    type: String,
    default: 'div'
  },
  height: {
    type: [String, Number],
    default: ''
  },
  maxHeight: {
    type: [String, Number],
    default: ''
  },
  noresize: Boolean, // 如果 container 尺寸不会发生变化，最好设置它可以优化性能
  always: Boolean, // 滚动条总是显示
  // 滚动条最小尺寸
  minSize: {
    type: Number,
    default: 20
  }
})

const ns = useNamespace('scrollbar')

const scrollbarRef = ref() // bar

const wrapRef = ref() // wrap

const resizeRef = ref() // view

// bar
const sizeWidth = ref('0')
const sizeHeight = ref('0')
const barRef = ref(null)
const ratioY = ref(1) // Y 比例
const ratioX = ref(1) // X 比例

provide(scrollbarContextKey, reactive({ scrollbarElement: scrollbarRef, wrapElement: wrapRef }))

// wrap class
const wrapKls = computed(() => {
  // wrapClass, el-scrollbar__wrap ,el-scrollbar__wrap--hidden-default
  return [props.wrapClass, ns.e('wrap'), { [ns.em('wrap', 'hidden-default')]: !props.native }]
})

// wrap style
const style = computed(() => {
  const style = {}
  if (props.height) style.height = addUnit(props.height)
  if (props.maxHeight) style.maxHeight = addUnit(props.maxHeight)
  return [props.wrapStyle, style]
})

// view class
const resizeKls = computed(() => {
  // scrollbar__view, viewClass
  return [ns.e('view'), props.viewClass]
})

// wrap scroll handle
const handleScroll = () => {
  // console.log('wrap scroll handle')
  if (wrapRef.value) {
    barRef.value && barRef.value.handleScroll(wrapRef.value)

    // emit('scroll', {
    //   scrollTop: wrapRef.value.scrollTop,
    //   scrollLeft: wrapRef.value.scrollLeft
    // })
  }
}

const update = () => {
  if (!wrapRef.value) return

  const offsetHeight = wrapRef.value.offsetHeight - GAP

  const offsetWidth = wrapRef.value.offsetWidth - GAP

  // scrollHeight 越大，originalHeight越小 200 * 200 / 201
  const originalHeight = offsetHeight ** 2 / wrapRef.value.scrollHeight
  console.log('originalHeight: ', originalHeight)

  const originalWidth = offsetWidth ** 2 / wrapRef.value.scrollWidth

  const height = Math.max(originalHeight, props.minSize)

  const width = Math.max(originalWidth, props.minSize)

  // 原始高度 / (wrap高度 - 默认最顶端时当前的原始高度) = 原始高度所占整个高度比例
  // 真实高度 / (wrap高度 - 默认最顶端时当前的原始高度) = 真实高度所占整个高度比例
  // ratioY.value = 原始高度/真实高度的比例
  // 如果originalHeight >= 20，height比例始终为1... 如果originalHeight小于20, 而height始终为minSize尺寸(默认20)

  // 10 / (200 - 10)     /    (20 / (200 - 20))  = 0.25
  // 0.05263157894736842 /    0.1111111111111111 = 0.47368421052631576
  ratioY.value = originalHeight / (offsetHeight - originalHeight) / (height / (offsetHeight - height))

  ratioX.value = originalWidth / (offsetWidth - originalWidth) / (width / (offsetWidth - width))

  // thumb高度 199 + 0 < 200
  sizeHeight.value = height + GAP < offsetHeight ? `${height}px` : ''

  sizeWidth.value = width + GAP < offsetWidth ? `${width}px` : ''
}

// 响应容器尺寸变化
let stopResizeObserver = undefined
let stopResizeListener = undefined

// 计算bar
watch(
  props.noresize,
  (noresize) => {
    if (noresize) {
      stopResizeObserver && stopResizeObserver()
      stopResizeListener && stopResizeListener()
    } else {
      ;({ stop: stopResizeObserver } = useResizeObserver(resizeRef, update))
      stopResizeListener = useEventListener('resize', update)
    }
  },
  { immediate: true }
)

// 监听height,maxHeight来计算 bar
watch(
  () => [props.maxHeight, props.height],
  () => {
    if (!props.native) {
      // TODO 为什么要用nextTick
      // nextTick(() => {})

      update()
      if (wrapRef.value) {
        // 调用bar的handleScroll
        barRef.value && barRef.value.handleScroll(wrapRef.value)
      }
    }
  }
)

onMounted(() => {
  //  nextTick(() => {})
  if (!props.native) update()
})

// 组件因为响应式状态变更而更新其 DOM 树之后调用
onUpdated(() => {
  console.log('onUpdated')
  update()
})
</script>

<style lang="scss">
@import '../style/scrollbar.scss';
</style>
