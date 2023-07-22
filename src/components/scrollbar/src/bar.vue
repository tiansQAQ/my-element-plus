<template>
  <transition :name="ns.b('fade')">
    <div v-show="always || visible" ref="barRef" :class="[ns.e('bar'), ns.is(bar.key)]" @mousedown="clickTrackHandler">
      <div ref="thumb" :class="ns.e('thumb')" :style="thumbStyle" @mousedown="clickThumbHandler"></div>
    </div>
  </transition>
</template>

<script setup>
import { ref, defineProps, computed, defineExpose, inject, toRef } from 'vue'
const GAP = 0 // top 2 + bottom 2 of bar instance
import { useNamespace } from '@/hooks'
import { scrollbarContextKey } from './constants'
import { useEventListener } from '@vueuse/core'

const renderThumbStyle = ({ move, size, bar }) => {
  return { [bar.size]: size, transform: `translate${bar.axis}(${move}%)` }
}

const BAR_MAP = {
  vertical: { offset: 'offsetHeight', scroll: 'scrollTop', scrollSize: 'scrollHeight', size: 'height', key: 'vertical', axis: 'Y', client: 'clientY', direction: 'top' },
  horizontal: { offset: 'offsetWidth', scroll: 'scrollLeft', scrollSize: 'scrollWidth', size: 'width', key: 'horizontal', axis: 'X', client: 'clientX', direction: 'left' }
}

//  -是否一直显示滚动条 -是否垂直滚动条 -size 对应的是 水平滚动条的 width 或 垂直滚动条的height -move 用于 translateX 或 translateY 属性中
const props = defineProps({ always: { type: Boolean, default: true }, vertical: Boolean, size: [String, Number], move: [String, Number] })

// 从BAR_MAP中返回一个的新对象，垂直滚动条属性集合 或 水平滚动条属性集合
const bar = computed(() => BAR_MAP[props.vertical ? 'vertical' : 'horizontal'])

const thumbStyle = computed(() => renderThumbStyle({ size: props.size, move: props.move, bar: bar.value }))

const ns = useNamespace('scrollbar')

const barRef = ref(null)

const thumb = ref(null)

const thumbState = ref({})

const scrollbar = inject(scrollbarContextKey)

const clickTrackHandler = (e) => {
  console.log('clickTrackHandler')

  // 偏移量 = 当前元素距离浏览器窗口的 顶部/左侧 距离 - 当前点击位置距离浏览器窗口的 顶部/左侧 距离
  const offset = Math.abs(e.target.getBoundingClientRect()[bar.value.direction] - e[bar.value.client])

  // 计算滑动块一半高度(根据浏览器滚动条操作行为，一般我们点击轨道某个点时，滑块的中心总会在我们的落点位置)
  const thumbHalf = thumb.value[bar.value.offset] / 2

  //  计算点击后，根据 偏移量 计算在 滚动条区域的总高度 中的占比，也就是 滚动块 所处的位置
  // offset - thumbHalf = 移动的距离
  // 移动的距离 / scrollHeight * 100 = 移动的百分比
  const thumbPositionPercentage = ((offset - thumbHalf) / barRef.value[bar.value.offset]) * 100
  //  设置wrapRef的 scrollHeight 或 scrollWidth 新值。达到滚动内容的效果
  scrollbar.wrapRef[bar.value.scroll] = (thumbPositionPercentage / 100) * scrollbar.wrapRef[bar.value.scrollSize]
}

let cursorDown = false //  记录按下状态

const visible = ref(false)

// 按下滚动条，并且鼠标移动时
const mouseMoveDocumentHandler = (e) => {
  //  如果按下状态为假，返回
  if (cursorDown === false) return

  //  点击位置时距滚动块底部的距离
  const prevPage = thumbState[bar.value.axis]
  if (!prevPage) return

  // （bar距离页面顶部的距离 - 鼠标移动时距离顶部的距离） * -1
  const offset = (barRef.value.getBoundingClientRect()[bar.value.direction] - e[bar.value.client]) * -1

  //  按下滑块位置距离滑块顶部的距离
  const thumbClickPosition = thumb.value[bar.value.offset] - prevPage

  //  滑动距离在滚动轨道长度的占比
  const thumbPositionPercentage = ((offset - thumbClickPosition) / barRef.value[bar.value.offset]) * 100

  //  根据比例，更新视图窗口的滚动距离
  scrollbar.wrapRef[bar.value.scroll] = (thumbPositionPercentage * scrollbar.wrapRef[bar.value.scrollSize]) / 100
}

const mouseUpDocumentHandler = () => {
  //  重置按下状态
  cursorDown = false
  //  重置当前点击在滚动块的位置
  thumbState[bar.value.axis] = 0
  //  移除监听鼠标事件
  document.removeEventListener('mousemove', mouseMoveDocumentHandler)
  document.removeEventListener('mouseup', mouseUpDocumentHandler)
  //  拖拽结束，此时允许鼠标长按划过文本选中。
  document.onselectstart = null
  visible.value = false
}

const startDrag = (e) => {
  // 执行stopImmediatePropagation方法,阻止事件冒泡,并且阻止该元素上绑定的其他相同事件监听函数的执行.
  e.stopImmediatePropagation()
  cursorDown = true
  //  监听鼠标移动事件
  document.addEventListener('mousemove', mouseMoveDocumentHandler)
  //  监听鼠标按键松开事件
  document.addEventListener('mouseup', mouseUpDocumentHandler)

  //  拖拽滚动块时，此时禁止鼠标长按划过文本选中。
  document.onselectstart = () => false
}

// 按下滑动块
const clickThumbHandler = (e) => {
  e.stopPropagation()
  /**
   * 防止右键单击滑动块
   * e.ctrlKey: 检测事件发生时Ctrl键是否被按住了
   * e.button： 指示当事件被触发时哪个鼠标按键被点击 0，鼠标左键；1，鼠标中键；2，鼠标右键
   */
  if (e.ctrlKey || [1, 2].includes(e.button)) return

  //  开始记录拖拽
  startDrag(e)
  // 记录点击滑块时的位置距滚动块底部的距离
  // 滑块的高度 -  (点击滑块距离顶部的位置 - 滑块元素距离顶部的位置)
  thumbState[bar.value.axis] = e.currentTarget[bar.value.offset] - (e[bar.value.client] - e.currentTarget.getBoundingClientRect()[bar.value.direction])
}

// visible show and false
const mouseMoveScrollbarHandler = () => {
  visible.value = !!props.size
}

const mouseLeaveScrollbarHandler = () => {
  visible.value = cursorDown
}

useEventListener(toRef(scrollbar, 'scrollbarRef'), 'mousemove', mouseMoveScrollbarHandler)

useEventListener(toRef(scrollbar, 'scrollbarRef'), 'mouseleave', mouseLeaveScrollbarHandler)

defineExpose({
  // handleScroll
})
</script>
