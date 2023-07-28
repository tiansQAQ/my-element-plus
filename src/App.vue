<template>
  <el-form>
    <el-form-item> <input /> </el-form-item>
  </el-form>
  <el-button type="danger">button</el-button>
  <el-card>我我我</el-card>
  <el-icon><Plus /></el-icon>

  <el-affix :offst="200">
    <h1 style="height: 400px">111</h1>
  </el-affix>
  <el-scrollbar height="200px">
    <div style="height: 400px">111</div>
  </el-scrollbar>
</template>

<script setup></script>

<style lang="scss">
* {
  padding: 0;
  margin: 0;
}
</style>
