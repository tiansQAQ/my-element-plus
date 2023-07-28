<template>
  <component
    :is="tag"
    ref="_ref"
    v-bind="_props"
    :class="[
      ns.b(),
      ns.m(_type),
      ns.m(_size),
      ns.is('disabled', _disabled),
      ns.is('loading', loading),
      ns.is('plain', plain),
      ns.is('round', round),
      ns.is('circle', circle),
      ns.is('text', text),
      ns.is('link', link),
      ns.is('has-bg', bg)
    ]"
    @click="handleClick"
  >
    <template v-if="loading">
      <slot v-if="$slots.loading" name="loading"></slot>
      <el-icon v-else :class="ns.is('loading')">
        <component :is="loadingIcon" />
      </el-icon>
    </template>
    <el-icon v-else-if="icon || $slots.icon">
      <component :is="icon" v-if="icon" />
      <slot v-else name="icon" />
    </el-icon>

    <span v-if="$slots.default">
      <slot />
    </span>
  </component>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'
import { useButton } from './use-button'
import { useNamespace } from '@/hooks'
defineOptions({ name: 'ElButton' })
const props = defineProps({
  size: {
    type: String,
    validator(value) {
      return ['large', 'default', 'small'].includes(value)
    },
    default: 'default'
  },
  // 自定义元素标签 string / Component
  tag: {
    type: [String, Object],
    default: 'button'
  },
  // 按钮是否为禁用状态
  disabled: Boolean,

  // 类型
  type: {
    validator(value) {
      return ['default', 'primary', 'success', 'warning', 'info', 'danger', 'text', ''].includes(value)
    },
    default: ''
  },
  // 图标组件
  icon: {
    type: [String, Object, Function],
    default: ''
  },
  // 原生 type 属性
  nativeType: {
    validator(value) {
      return ['button', 'submit', 'reset'].includes(value)
    },
    default: 'button'
  },
  //是否为加载中状态
  loading: Boolean,
  // 自定义加载中状态图标组件
  loadingIcon: {
    type: [String, Object, Function],
    default: () => Loading
  },
  // 是否为朴素按钮
  plain: Boolean,

  // 是否为文字按钮
  text: Boolean,
  // 是否为链接按钮
  link: Boolean,
  // 是否显示文字按钮背景颜色
  bg: Boolean,
  // 原生 autofocus 属性
  autofocus: Boolean,
  // 是否为圆角按钮
  round: Boolean,
  // 是否为圆形按钮

  circle: Boolean,

  // 自定义按钮颜色, 并自动计算 hover 和 active 触发后的颜色
  color: String,
  // dark 模式, 意味着自动设置 color 为 dark 模式的颜色
  dark: Boolean,
  //自动在两个中文字符之间插入空格
  autoInsertSpace: Boolean,

  // 自定义元素标签
  tag: {
    type: [String, Object],
    default: 'button'
  }
})

const emit = defineEmits(['click'])

const ns = useNamespace('button')

const { _ref, _type, _props, _size, _disabled, handleClick } = useButton(props, emit)

defineExpose({
  /** @description button html element */
  ref: _ref,
  /** @description button size */
  size: _size,
  /** @description button type */
  type: _type
})
</script>
