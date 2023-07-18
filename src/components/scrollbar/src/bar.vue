<template>
  <thumb :move="moveY" :ratio="ratioY" :size="height" vertical :always="always" />
</template>

<script setup>
import Thumb from './thumb.vue'
import { ref, defineProps, computed, defineExpose } from 'vue'
const GAP = 4 // top 2 + bottom 2 of bar instance

const props = defineProps({
  always: {
    type: Boolean,
    default: true
  },
  width: String,
  height: String,
  ratioX: {
    type: Number,
    default: 1
  },
  ratioY: {
    type: Number,
    default: 1
  }
})

const moveX = ref(0)
const moveY = ref(0)

const handleScroll = (wrap) => {
  if (wrap) {
    const offsetHeight = wrap.offsetHeight - GAP
    const offsetWidth = wrap.offsetWidth - GAP

    moveY.value = ((wrap.scrollTop * 100) / offsetHeight) * props.ratioY
    moveX.value = ((wrap.scrollLeft * 100) / offsetWidth) * props.ratioX
  }
}

defineExpose({
  handleScroll
})
</script>
