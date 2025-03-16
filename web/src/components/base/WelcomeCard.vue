<template>
  <div class="welcome-card card">
    <h2 class="welcome-title mb-sm">{{ greeting }}，{{ userName }}</h2>
    <p class="welcome-subtitle mb-md">{{ currentDate }}</p>
    <div class="quick-actions d-flex">
      <slot name="actions">
        <button class="btn btn-primary mr-md">{{ primaryActionText }}</button>
        <button class="btn btn-secondary">{{ secondaryActionText }}</button>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomeCard',
  props: {
    // 用戶名稱 User name
    userName: {
      type: String,
      default: '管理員'
    },
    // 問候語 Greeting
    greeting: {
      type: String,
      default: '歡迎回來'
    },
    // 主要操作按鈕文本 Primary action button text
    primaryActionText: {
      type: String,
      default: '新增老師'
    },
    // 次要操作按鈕文本 Secondary action button text
    secondaryActionText: {
      type: String,
      default: '排課管理'
    },
    // 日期格式 Date format
    dateFormat: {
      type: Object,
      default: () => ({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
  },
  computed: {
    // 當前日期 Current date
    currentDate() {
      return `今天是 ${new Date().toLocaleDateString('zh-TW', this.dateFormat)}，以下是您的系統概覽`;
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.welcome-card {
  background: linear-gradient(135deg, #0071e3, #5ac8fa); // 漸變背景 Gradient background
  color: white;
  border-radius: var(--radius-lg); // 大圓角 Large border radius
  overflow: hidden; // 隱藏溢出內容 Hide overflow content
  position: relative; // 相對定位 Relative positioning
  
  // 添加背景圖案 Add background pattern
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    border-radius: 50%;
    transform: translate(30%, -30%);
    pointer-events: none; // 不影響鼠標事件 Don't affect mouse events
  }
  
  .welcome-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin-top: 0;
    position: relative; // 相對定位 Relative positioning
    z-index: 1; // 層級 Z-index
  }
  
  .welcome-subtitle {
    font-size: var(--font-size-md);
    opacity: 0.9;
    position: relative; // 相對定位 Relative positioning
    z-index: 1; // 層級 Z-index
  }
  
  .quick-actions {
    position: relative; // 相對定位 Relative positioning
    z-index: 1; // 層級 Z-index
  }
  
  .btn-primary {
    background-color: white;
    color: var(--color-primary);
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
    }
  }
  
  .btn-secondary {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
}

// 工具類 Utility classes
.mr-md {
  margin-right: var(--spacing-md);
}
</style> 