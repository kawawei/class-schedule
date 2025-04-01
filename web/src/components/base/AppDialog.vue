<template>
  <transition name="dialog-fade">
    <div v-if="modelValue" class="app-dialog-overlay" @click.self="closeDialog">
      <transition name="dialog-zoom">
        <div class="app-dialog" :class="{ 'app-dialog-lg': size === 'lg', 'app-dialog-sm': size === 'sm' }">
          <div class="app-dialog-header">
            <h3 class="app-dialog-title">{{ title }}</h3>
            <button class="app-dialog-close" @click="closeDialog">×</button>
          </div>
          <div class="app-dialog-body">
            <slot></slot>
          </div>
          <div class="app-dialog-footer">
            <slot name="footer">
              <AppButton type="secondary" @click="closeDialog">取消</AppButton>
              <AppButton type="primary" @click="confirmDialog" :loading="loading">確定</AppButton>
            </slot>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
/**
 * 對話框組件
 * Dialog component
 */
export default {
  name: 'AppDialog',
  props: {
    // 對話框標題 Dialog title
    title: {
      type: String,
      default: '對話框'
    },
    // 對話框大小 Dialog size (sm, md, lg)
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    // 對話框是否可見 Dialog visibility (v-model)
    modelValue: {
      type: Boolean,
      default: false
    },
    // 是否正在加載 Whether the dialog is loading
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'confirm', 'close'],
  methods: {
    /**
     * 關閉對話框 Close dialog
     */
    closeDialog() {
      console.log('關閉對話框 Close dialog');
      this.$emit('update:modelValue', false);
    },
    
    /**
     * 確認操作 Confirm operation
     */
    confirmDialog() {
      // 防止重複觸發 Prevent duplicate triggers
      if (this.isConfirming) return;
      this.isConfirming = true;
      
      console.log('確認操作 Confirm operation');
      this.$emit('confirm');
      
      // 使用 setTimeout 確保事件處理完成後再重置狀態
      // Use setTimeout to ensure state is reset after event handling
      setTimeout(() => {
        this.isConfirming = false;
      }, 300);
    },

    cancelDialog() {
      // 防止重複觸發 Prevent duplicate triggers
      if (this.isCanceling) return;
      this.isCanceling = true;
      
      console.log('取消操作 Cancel operation');
      this.$emit('cancel');
      
      // 使用 setTimeout 確保事件處理完成後再重置狀態
      // Use setTimeout to ensure state is reset after event handling
      setTimeout(() => {
        this.isCanceling = false;
      }, 300);
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

// 對話框淡入淡出動畫 Dialog fade animation
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

// 對話框縮放動畫 Dialog zoom animation
.dialog-zoom-enter-active,
.dialog-zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-zoom-enter-from,
.dialog-zoom-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

.app-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
  overflow-y: auto;
  padding: var(--spacing-md);
}

.app-dialog {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  width: 500px;
  max-width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1000000;
  
  &.app-dialog-sm {
    width: 400px;
  }
  
  &.app-dialog-lg {
    width: 700px;
  }
}

.app-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-200);
  position: relative;
  z-index: 1000001;
}

.app-dialog-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.app-dialog-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--text-primary);
  }
}

.app-dialog-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
  position: relative;
  z-index: 1000001;
}

.app-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--color-gray-200);
  position: relative;
  z-index: 1000001;
}

// 確認刪除對話框的按鈕置中對齊
.app-dialog-sm .app-dialog-footer {
  justify-content: center; // 小型對話框（如確認刪除）按鈕置中對齊
}
</style> 