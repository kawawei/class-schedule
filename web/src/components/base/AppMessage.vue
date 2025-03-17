<template>
  <Transition name="message-fade">
    <div v-if="visible" :class="['app-message', `app-message-${type}`]">
      <div class="message-icon">
        <!-- 成功圖標 Success icon -->
        <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <!-- 錯誤圖標 Error icon -->
        <svg v-else-if="type === 'error'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <!-- 警告圖標 Warning icon -->
        <svg v-else-if="type === 'warning'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <!-- 信息圖標 Info icon -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      </div>
      <div class="message-content">{{ message }}</div>
      <div class="message-close" @click="close">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'AppMessage',
  props: {
    // 訊息類型：success, error, warning, info Message type: success, error, warning, info
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    // 訊息內容 Message content
    message: {
      type: String,
      required: true
    },
    // 顯示時間（毫秒），0表示不自動關閉 Display time (ms), 0 means no auto close
    duration: {
      type: Number,
      default: 3000
    }
  },
  data() {
    return {
      visible: true,
      timer: null
    };
  },
  mounted() {
    // 如果設置了顯示時間，則自動關閉 If duration is set, auto close
    if (this.duration > 0) {
      this.timer = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  },
  beforeUnmount() {
    // 清除計時器 Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
    }
  },
  methods: {
    // 關閉訊息 Close message
    close() {
      this.visible = false;
      this.$emit('close');
    }
  }
};
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

// 訊息淡入淡出動畫 Message fade animation
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from,
.message-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.app-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 300px;
  max-width: 80%;
  
  // 成功訊息樣式 Success message style
  &.app-message-success {
    background-color: #f0f9eb;
    border: 1px solid #e1f3d8;
    color: #67c23a;
    
    .message-icon {
      color: #67c23a;
    }
  }
  
  // 錯誤訊息樣式 Error message style
  &.app-message-error {
    background-color: #fef0f0;
    border: 1px solid #fde2e2;
    color: #f56c6c;
    
    .message-icon {
      color: #f56c6c;
    }
  }
  
  // 警告訊息樣式 Warning message style
  &.app-message-warning {
    background-color: #fdf6ec;
    border: 1px solid #faecd8;
    color: #e6a23c;
    
    .message-icon {
      color: #e6a23c;
    }
  }
  
  // 信息訊息樣式 Info message style
  &.app-message-info {
    background-color: #f4f4f5;
    border: 1px solid #e9e9eb;
    color: #909399;
    
    .message-icon {
      color: #909399;
    }
  }
  
  .message-icon {
    margin-right: 10px;
    display: flex;
    align-items: center;
  }
  
  .message-content {
    flex: 1;
    font-size: var(--font-size-sm);
  }
  
  .message-close {
    margin-left: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    opacity: 0.7;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
}

// 響應式樣式 Responsive styles
@media (max-width: 768px) {
  .app-message {
    min-width: 90%;
    max-width: 90%;
  }
}
</style> 