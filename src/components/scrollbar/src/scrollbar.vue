<template>
  <div ref="scrollbarRef" :class="[ns.b()]">111</div>
</template>

<script setup>
import { ref } from 'vue'
import { useNamespace } from '@/hooks'
const COMPONENT_NAME = 'ElScrollbar'

defineOptions({ name: COMPONENT_NAME })
const ns = useNamespace('scrollbar')

// root dom
const scrollbarRef = ref()
</script>
