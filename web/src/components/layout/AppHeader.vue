<template>
  <header class="app-header frosted-glass">
    <div class="container d-flex justify-content-between align-items-center">
      <div class="header-left">
        <slot name="left">
          <h1 class="header-title">{{ title }}</h1>
        </slot>
      </div>
      <div class="header-right d-flex align-items-center">
        <div class="user-info d-flex align-items-center">
          <span class="user-name">{{ userName }}</span>
          <div class="user-avatar">
            <img :src="userAvatar || defaultAvatar" :alt="`${userName}頭像`">
          </div>
          <button class="logout-btn" @click="handleLogout" :disabled="isLoggingOut">
            <svg v-if="!isLoggingOut" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span v-if="isLoggingOut" class="loading-spinner"></span>
            <span>{{ isLoggingOut ? '登出中...' : '登出' }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    // 頁面標題 Page title
    title: {
      type: String,
      default: '才藝老師管理系統'
    },
    // 用戶名稱 User name
    userName: {
      type: String,
      default: '管理員'
    },
    // 用戶頭像 User avatar
    userAvatar: {
      type: String,
      default: ''
    },
    // 登出狀態 Logout state
    isLoggingOut: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 默認頭像 Default avatar
      defaultAvatar: 'https://ui-avatars.com/api/?name=Admin&background=0071e3&color=fff'
    };
  },
  methods: {
    /**
     * 處理登出事件 Handle logout event
     */
    handleLogout() {
      // 觸發登出事件 Emit logout event
      this.$emit('logout');
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-header {
  position: sticky; // 固定在頂部 Sticky at the top
  top: 0;
  z-index: 100;
  padding: var(--spacing-md) 0;
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  background-color: rgba(255, 255, 255, 0.8); // 半透明背景 Semi-transparent background
  backdrop-filter: blur(10px); // 毛玻璃效果 Frosted glass effect
  -webkit-backdrop-filter: blur(10px);
}

.container {
  padding-right: 0; // 移除右側內邊距 Remove right padding
}

.header-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin: 0;
}

.header-right {
  position: relative; // 設置相對定位 Set relative positioning
  right: -40px; // 向右偏移 Offset to the right
}

.user-info {
  display: flex;
  align-items: center;
  
  .user-name {
    margin-right: var(--spacing-md);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
  }
  
  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    margin-right: var(--spacing-md);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  background-color: rgba(255, 59, 48, 0.1);
  color: var(--color-danger);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  
  svg {
    margin-right: 6px;
  }
  
  &:hover {
    background-color: rgba(255, 59, 48, 0.2);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
}

// 加載中動畫 Loading spinner
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 6px;
  border: 2px solid rgba(255, 59, 48, 0.3);
  border-radius: 50%;
  border-top-color: var(--color-danger);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 