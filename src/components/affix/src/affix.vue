<template>
  <div ref="root" :class="[ns.b()]" :style="rootStyle">
    <div :class="{ [ns.m('fixed')]: fixed }" :style="affixStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
// https://github.com/CodeListener/element-plus-affix
import { defineProps, onMounted, shallowRef, defineOptions, computed, ref, watchEffect, watch } from 'vue'
import { throwError, getScrollContainer, isNumber, isBoolean, addUnit } from '@/utils'
import { useNamespace } from '@/hooks'
import { useElementBounding, useEventListener, useWindowSize } from '@vueuse/core'
import { CHANGE_EVENT } from '@/constants'
const COMPONENT_NAME = 'ElAffix'

// 设置组件名
defineOptions({ name: COMPONENT_NAME })

const props = defineProps({
  // z-index
  zIndex: {
    type: [Number, String],
    default: 100
  },

  // target container. 指定容器 (CSS 选择器)
  target: {
    type: String,
    default: ''
  },
  // offset distance 偏移距离
  offset: {
    type: Number,
    default: 0
  },
  // position of affix 位置
  position: {
    type: [String, Number],
    values: ['top', 'bottom'],
    default: 'top'
  }
})
const emit = defineEmits({
  scroll: ({ scrollTop, fixed }) => isNumber(scrollTop) && isBoolean(fixed),
  [CHANGE_EVENT]: (fixed) => isBoolean(fixed)
})

const ns = useNamespace('affix')

const fixed = ref(false)

const target = shallowRef(null)
// 目标元素
const root = shallowRef()
const scrollTop = ref(0)

const transform = ref(0)

// 获得可滚动的父容器
const scrollContainer = shallowRef()

//  目标元素信息: HTML元素的 bounding box 响应式 update:手动触发更新目标的边界信息
const { height: rootHeight, width: rootWidth, top: rootTop, bottom: rootBottom, update: updateRoot } = useElementBounding(root, { windowScroll: false })
const targetRect = useElementBounding(target)

// 响应式获取窗口尺寸
const { height: windowHeight } = useWindowSize()

// 发生定位的时候,保留原始宽度和高度
const rootStyle = computed(() => {
  return {
    height: fixed.value ? `${rootHeight.value}px` : '',
    width: fixed.value ? `${rootWidth.value}px` : ''
  }
})

const affixStyle = computed(() => {
  if (!fixed.value) return {}
  const offset = props.offset ? addUnit(props.offset) : 0

  return {
    height: `${rootHeight.value}px`,
    width: `${rootWidth.value}px`,
    top: props.position === 'top' ? offset : '',
    bottom: props.position === 'bottom' ? offset : '',
    zIndex: props.zIndex,
    transform: transform.value ? `translateY(${transform.value}px)` : '' // TODO
  }
})
onMounted(() => {
  if (props.target) {
    target.value = document.querySelector(props.target) ?? undefined
    if (!target.value) {
      throwError(COMPONENT_NAME, `Target is not existed: ${props.target}`)
    }
  } else {
    target.value = document.documentElement
  }
  scrollContainer.value = getScrollContainer(root.value, true)
})

const handleScroll = () => {
  updateRoot()
  emit('scroll', { scrollTop: scrollTop.value, fixed: fixed.value })
}
// fixed 状态改变时触发的事件
watch(fixed, (val) => emit('change', val))

// 监听scrollContainer滚动容器
useEventListener(scrollContainer, 'scroll', handleScroll)

const update = () => {
  if (!scrollContainer.value) return
  scrollTop.value = scrollContainer.value instanceof Window ? document.documentElement.scrollTop : scrollContainer.value.scrollTop || 0
  if (props.position === 'top') {
    // props.target：在指定父容器消失之后，目标元素取消 fixed 状态
    if (props.target) {
      // targetRect.bottom.value > 0 target(父容器)必须在可视窗口内，即 targetRect.bottom 如果小于 0 则意味着父容器从可视窗口顶部消失，取消掉 fixed 状态
      fixed.value = props.offset > rootTop.value && targetRect.bottom.value > 0
      // 目标元素过渡计算：父容器底部位置 - 传入的偏移量 - 目标高度
      // 父容器底部在滚动时位置是实时变化，当不再可视窗口内时,修改affix transfrom
      const difference = targetRect.bottom.value - props.offset - rootHeight.value
      // 设置到affixStyle transform的translateY值
      transform.value = difference < 0 ? difference : 0
    } else {
      fixed.value = props.offset > rootTop.value
    }
    // bottom
  } else if (props.target) {
    // rootHeight, offset targetTop

    // rwindowHeight.value > targetRect.top.value: target(父容器)必须在可视窗口内，即 targetRect.top 如果大于可视窗口高度(windowHeight) 则意味着父容器从可视窗口底部消失，这时取消掉fixed状态
    fixed.value = windowHeight.value - props.offset < rootBottom.value && windowHeight.value > targetRect.top.value

    // 不能超出target容器
    // 可视窗口高度[常量] - 父容器顶部位置top[动态] - 传入的偏移量[常量] - 目标元素的高度[常量]
    const difference = windowHeight.value - targetRect.top.value - props.offset - rootHeight.value
    transform.value = difference < 0 ? -difference : 0
  } else {
    // 窗口高度 - 传入的偏移量 < 目标元素的底部位置
    fixed.value = windowHeight.value - props.offset < rootBottom.value
  }
}
// 使用 watchEffect(update) 更新fixed的状态(通过依赖目标元素rootTop,rootBottom变更，对fixed状态进行设置)
watchEffect(update)

// https://juejin.cn/post/7202868242363711525
defineExpose({
  /** @description update affix status  */
  // 手动更新固钉状态
  update,
  // 手动更新根元素的盒模型信息
  /** @description update rootRect info */
  updateRoot
})
</script>

<style lang="scss">
@import '../style/affix.scss';
</style>
