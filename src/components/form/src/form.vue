<template>
  <form class="form">
    <slot />
  </form>
</template>

<script setup>
const COMPONENT_NAME = 'ElForm'
defineOptions({ name: COMPONENT_NAME })
</script>
