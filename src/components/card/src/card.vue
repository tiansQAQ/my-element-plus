<template>
  <div :class="[ns.b(), ns.is(`${shadow}-shadow`)]">
    <div v-if="$slots.header || header" :class="[ns.e('header')]">
      <slot name="header">{{ header }}</slot>
    </div>
    <div :class="[ns.e('body')]" :style="bodyStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { defineOptions, defineProps } from 'vue'
import { useNamespace } from '@/hooks'

defineOptions({ name: 'ElCard' })
defineProps({
  header: {
    type: String,
    default: ''
  },
  bodyStyle: {
    type: [String, Object, Array],
    default: ''
  },
  shadow: {
    type: String,
    values: ['always', 'hover', 'never'],
    default: 'always'
  }
})
const ns = useNamespace('card')
</script>

<style lang="scss">
@import '../style/card.scss';
</style>
