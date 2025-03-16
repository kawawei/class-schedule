<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="not-found-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      <h1 class="not-found-title">找不到頁面</h1>
      <p class="not-found-message">您嘗試訪問的頁面不存在或已被移除。</p>
      <router-link to="/dashboard" class="btn btn-primary">返回儀表板</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.not-found-container {
  display: flex; // 使用彈性布局 Use flexbox layout
  align-items: center; // 垂直居中 Vertical center
  justify-content: center; // 水平居中 Horizontal center
  min-height: 100vh; // 最小高度為視窗高度 Minimum height is viewport height
  background-color: var(--bg-secondary); // 使用背景色變量 Use background color variable
  padding: var(--spacing-lg); // 內邊距 Padding
}

.not-found-content {
  text-align: center; // 文字居中 Center text
  max-width: 500px; // 最大寬度 Maximum width
  padding: var(--spacing-xl); // 內邊距 Padding
  background-color: var(--bg-primary); // 使用背景色變量 Use background color variable
  border-radius: var(--radius-lg); // 圓角 Border radius
  box-shadow: var(--shadow-md); // 陰影 Shadow
}

.not-found-icon {
  margin-bottom: var(--spacing-lg); // 底部間距 Bottom margin
  color: var(--color-secondary); // 圖標顏色 Icon color
  
  svg {
    width: 64px; // 圖標寬度 Icon width
    height: 64px; // 圖標高度 Icon height
  }
}

.not-found-title {
  font-size: var(--font-size-xxl); // 標題字體大小 Title font size
  font-weight: var(--font-weight-bold); // 字體粗細 Font weight
  margin-bottom: var(--spacing-md); // 底部間距 Bottom margin
  color: var(--text-primary); // 文字顏色 Text color
}

.not-found-message {
  font-size: var(--font-size-md); // 消息字體大小 Message font size
  color: var(--text-secondary); // 文字顏色 Text color
  margin-bottom: var(--spacing-xl); // 底部間距 Bottom margin
  line-height: 1.5; // 行高 Line height
}

.btn {
  display: inline-flex; // 內聯彈性布局 Inline flex
  align-items: center; // 垂直居中 Vertical center
  justify-content: center; // 水平居中 Horizontal center
  padding: var(--spacing-sm) var(--spacing-xl); // 內邊距 Padding
  border-radius: var(--radius-full); // 圓角 Border radius
  font-weight: var(--font-weight-medium); // 字體粗細 Font weight
  font-size: var(--font-size-md); // 字體大小 Font size
  cursor: pointer; // 鼠標指針 Cursor
  transition: all var(--transition-fast); // 過渡效果 Transition
  border: none; // 無邊框 No border
  outline: none; // 無輪廓 No outline
  text-decoration: none; // 無文本裝飾 No text decoration
  
  &-primary {
    background-color: var(--color-primary); // 背景色 Background color
    color: white; // 文字顏色 Text color
    
    &:hover {
      background-color: color.adjust(#0071e3, $lightness: -5%); // 懸停時背景色變深 Darken background on hover
    }
  }
}
</style> 