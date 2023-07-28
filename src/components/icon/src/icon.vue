<!--https://element-plus.org/zh-CN/component/icon.html#%E4%BD%BF%E7%94%A8%E5%8C%85%E7%AE%A1%E7%90%86%E5%99%A8 -->

<template>
  <i :class="ns.b()" :style="style" v-bind="$attrs">
    <slot />
  </i>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import { useNamespace } from '@/hooks'
import { addUnit } from '@/utils'

defineOptions({ name: 'ElIcon', inheritAttrs: false })
// inheritAttrs: true 没在子组件props中声明的属性加在子组件的根html标签上，声明之后就不加。
const props = defineProps({ size: { type: [String, Number] }, color: { type: String } })
const ns = useNamespace('icon')

const style = computed(() => {
  const { size, color } = props
  if (!size && !color) return {}
  return { fontSize: size === undefined ? undefined : addUnit(size), '--color': color }
})
</script>
