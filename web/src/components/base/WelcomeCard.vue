<template>
  <div class="welcome-card card">
    <h2 class="welcome-title mb-sm">{{ greeting }}，{{ userName }}</h2>
    <p class="welcome-subtitle mb-xs">{{ currentDate }}</p>
    <p class="welcome-time mb-md">{{ currentTime }}</p>
  </div>
</template>

<script>
import { formatDate, formatTime, TAIWAN_TIMEZONE } from '@/utils/timezone';

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
    // 日期格式 Date format
    dateFormat: {
      type: Object,
      default: () => ({
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    },
    // 時區 Timezone
    timezone: {
      type: String,
      default: TAIWAN_TIMEZONE // 使用時區工具中的台灣時區 Use Taiwan timezone from timezone utility
    }
  },
  data() {
    return {
      time: new Date(),
      timer: null
    };
  },
  computed: {
    // 當前日期 Current date
    currentDate() {
      return `今天是 ${formatDate(this.time, this.dateFormat)}，以下是您的系統概覽`;
    },
    // 當前時間 Current time
    currentTime() {
      return `現在時間：${formatTime(this.time)}`;
    }
  },
  methods: {
    // 更新時間 Update time
    updateTime() {
      this.time = new Date();
    }
  },
  mounted() {
    // 每秒更新時間 Update time every second
    this.timer = setInterval(this.updateTime, 1000);
  },
  beforeUnmount() {
    // 清除計時器 Clear timer
    if (this.timer) {
      clearInterval(this.timer);
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
  z-index: 1; // 設置較低的 z-index，確保不會擋住菜單 Set lower z-index to ensure it doesn't block the menu
  
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
  }
  
  .welcome-subtitle {
    font-size: var(--font-size-md);
    opacity: 0.9;
    position: relative; // 相對定位 Relative positioning
  }
  
  .welcome-time {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    opacity: 0.9;
    position: relative; // 相對定位 Relative positioning
  }
}

// 工具類 Utility classes
.mb-xs {
  margin-bottom: var(--spacing-xs);
}

.mb-sm {
  margin-bottom: var(--spacing-sm);
}

.mb-md {
  margin-bottom: var(--spacing-md);
}
</style> 