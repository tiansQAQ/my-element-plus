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

const GAP = 4 // top 2 + bottom 2 of bar instance
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
  console.log('update')

  if (!wrapRef.value) return

  const offsetHeight = wrapRef.value.offsetHeight - GAP

  const offsetWidth = wrapRef.value.offsetWidth - GAP

  const originalHeight = offsetHeight ** 2 / wrapRef.value.scrollHeight

  const originalWidth = offsetWidth ** 2 / wrapRef.value.scrollWidth
  const height = Math.max(originalHeight, props.minSize)

  const width = Math.max(originalWidth, props.minSize)

  // 代码计算元素原始大小与纵向和横向可用空间之间的比率，并将这些值设置为响应式变量 ratioY 和 ratioX。
  // 计算出的原始高度 / (元素高度 - 计算出的原始高度) / (计算出的原始高度,最小20px / (元素高度 - 计算出的原始高度,最小20px ) )
  ratioY.value = originalHeight / (offsetHeight - originalHeight) / (height / (offsetHeight - height))

  ratioX.value = originalWidth / (offsetWidth - originalWidth) / (width / (offsetWidth - width))

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
