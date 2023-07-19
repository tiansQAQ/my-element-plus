<template>
  <thumb :move="moveY" :ratio="ratioY" :size="height" vertical :always="always" />
</template>

<script setup>
import Thumb from './thumb.vue'
import { ref, defineProps, computed, defineExpose } from 'vue'
const GAP = 0 // top 2 + bottom 2 of bar instance

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

    console.log('wrap.scrollTop: ', wrap.scrollTop)
    console.log('props.ratioY: ', props.ratioY)

    // 滚动条高度 = 滚动高度与可见高度的比例 * 真实高度与最小高度的比例
    // 虽然滚动条最小高度为20，但是还是要按照滚动条真实高度去计算
    moveY.value = ((wrap.scrollTop * 100) / offsetHeight) * props.ratioY
    console.log(' moveY.value : ', moveY.value)

    moveX.value = ((wrap.scrollLeft * 100) / offsetWidth) * props.ratioX
  }
}

defineExpose({
  handleScroll
})
</script>
