<template>
  <el-watermark content="water">
    <div style="height: 500px" />
  </el-watermark>
  <!-- <div ref="article" :name="attributes" id="articleParent">
    <div id="articleChild" v-if="isChangeChild">子节点变动</div>
    <div v-text="characterData"></div>
    {{ characterData }}
  </div> -->
  <!-- <div>
    <button @click="isChangeChild = !isChangeChild">子节点变动</button>
    <button @click="attributes = `attributes${Math.random()}`">attributes属性变动</button>
    <button @click="characterData = `${Math.random()}`">节点内容或节点文本的变动</button>
  </div> -->
</template>

<script setup>
// import { shallowRef, onMounted, ref } from 'vue'

// const article = shallowRef(null)

// const isChangeChild = ref(true)

// const attributes = ref('attributes')

// const characterData = ref('节点文本')

// onMounted(() => {
//   init()
// })

// const init = () => {
//   const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//       // console.log('target', mutation.target.id)
//       console.log('mutation: ', mutation)
//     })
//   })

//   observer.observe(article.value, {
//     // childList: true,
//     // subtree: true,
//     attributes: true
//     // characterData: true
//   })
// }
</script>
<style lang="scss">
* {
  padding: 0;
  margin: 0;
}
</style>
