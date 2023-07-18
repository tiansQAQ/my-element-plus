<template>
  <transition :name="ns.b('fade')">
    <div :class="[ns.e('bar'), ns.is(bar.key)]">
      <div v-show="always || visible" ref="thumb" :class="ns.e('thumb')" :style="thumbStyle"></div>
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

// 显示或隐藏scrollbar

const visible = ref(false)

useEventListener(toRef(scrollbar, 'scrollbarElement'), 'mousemove', () => {
  visible.value = !!props.size
})

useEventListener(toRef(scrollbar, 'scrollbarElement'), 'mouseleave', () => {
  visible.value = false
})
</script>

<style></style>
