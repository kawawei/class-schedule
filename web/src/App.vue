<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
}
</script>

<style lang="scss">
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-container {
  min-height: 100vh; // 最小高度為視窗高度 Minimum height is viewport height
  display: flex; // 使用彈性布局 Use flexbox layout
  flex-direction: column; // 垂直排列 Vertical arrangement
}
</style> 