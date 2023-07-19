<!--https://juejin.cn/post/6844903834175668237-->
<template>
  <transition :name="ns.b('fade')">
    <div :class="[ns.e('bar'), ns.is(bar.key)]" @mousedown="clickTrackHandler">
      <div v-show="always || visible" ref="thumb" :class="ns.e('thumb')" :style="thumbStyle" @mousedown="clickThumbHandler"></div>
    </div>
  </transition>
</template>

<script setup>
import { defineProps, computed, ref, inject, toRef } from 'vue'
import { useNamespace } from '@/hooks'
import { scrollbarContextKey } from './constants'
import { useEventListener } from '@vueuse/core'

const BAR_MAP = {
  vertical: { offset: 'offsetHeight', scroll: 'scrollTop', scrollSize: 'scrollHeight', size: 'height', key: 'vertical', axis: 'Y', client: 'clientY', direction: 'top' },
  horizontal: { offset: 'offsetWidth', scroll: 'scrollLeft', scrollSize: 'scrollWidth', size: 'width', key: 'horizontal', axis: 'X', client: 'clientX', direction: 'left' }
}
const renderThumbStyle = ({ move, size, bar }) => {
  return { [bar.size]: size, transform: `translate${bar.axis}(${move}%)` }
}

const props = defineProps({ vertical: Boolean, size: String, move: Number, ratio: { type: Number, required: true }, always: Boolean })

const ns = useNamespace('scrollbar')

const scrollbar = inject(scrollbarContextKey)

const bar = computed(() => BAR_MAP[props.vertical ? 'vertical' : 'horizontal'])

const thumbStyle = computed(() => renderThumbStyle({ size: props.size, move: props.move, bar: bar.value }))

let cursorDown = false // 记录按下状态
let cursorLeave = false // 记录离开状态

// 显示或隐藏scrollbar
const visible = ref(false)

useEventListener(toRef(scrollbar, 'scrollbarElement'), 'mousemove', () => {
  cursorLeave = false
  visible.value = !!props.size
})

useEventListener(toRef(scrollbar, 'scrollbarElement'), 'mouseleave', () => {
  cursorLeave = true
  visible.value = cursorDown
})

const thumb = ref()

// 对按下滚动条区域的某一个位置进行快速定位
const clickTrackHandler = (e) => {
  if (!thumb.value) return
  console.log('clickTrackHandler')
  // 偏移量 = 当前元素距离浏览器窗口的 顶部/左侧 距离 - 当前点击位置距离浏览器窗口的 顶部/左侧 距离

  // const offset = e.target.getBoundingClientRect()[bar.value.direction] - e[bar.value.client]

  // 计算滑动块一半高度(根据浏览器滚动条操作行为，一般我们点击轨道某个点时，滑块的中心总会在我们的落点位置)
  // const thumbHalf = thumb.value[bar.value.offset] / 2

  // 偏移量 offset 减去滚动块的一半高度 thumbHalf 后得出滑块总移动的长度
  // 再用 滑块总移动的长度 除 滚动区域的总高度，得出 滚动比例thumbPositionPercentage

  //  设置外壳的 scrollTop 或 scrollLeft 新值。达到滚动内容的效果
}

const clickThumbHandler = (e) => {
  e.stopPropagation()

  // 阻止中键和右键
  if (e.ctrlKey || [1, 2].includes(e.button)) return

  // 取消选中
  window.getSelection() && window.getSelection().removeAllRanges()
  startDrag(e)
}

const startDrag = (e) => {
  e.stopImmediatePropagation()
  //  cursorDown = true

  //
}
</script>

<style></style>
