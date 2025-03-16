<template>
  <button
    class="app-button"
    :class="[
      `btn-${type}`,
      `btn-${size}`,
      { 'btn-rounded': rounded },
      { 'btn-block': block },
      { 'btn-loading': loading },
      { 'btn-disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <span v-else-if="$slots.icon" class="btn-icon">
      <slot name="icon"></slot>
    </span>
    <span class="btn-content">
      <slot>{{ text }}</slot>
    </span>
  </button>
</template>

<script>
export default {
  name: 'AppButton',
  props: {
    // 按鈕類型 Button type (primary, secondary, success, warning, danger, info)
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    // 按鈕大小 Button size (sm, md, lg)
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    },
    // 是否圓角 Whether the button has rounded corners
    rounded: {
      type: Boolean,
      default: true
    },
    // 是否禁用 Whether the button is disabled
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否加載中 Whether the button is in loading state
    loading: {
      type: Boolean,
      default: false
    },
    // 是否塊級元素 Whether the button is a block element
    block: {
      type: Boolean,
      default: false
    },
    // 按鈕文本 Button text
    text: {
      type: String,
      default: ''
    }
  },
  methods: {
    // 處理點擊事件 Handle click event
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-medium);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: none;
  padding: 0 var(--spacing-lg);
  transition: all var(--transition-fast);
  cursor: pointer;
  outline: none;
  position: relative;
  overflow: hidden;
  
  // 大小變體 Size variants
  &.btn-sm {
    height: 32px;
    font-size: var(--font-size-xs);
    border-radius: var(--radius-sm);
  }
  
  &.btn-md {
    height: 40px;
    font-size: var(--font-size-sm);
    border-radius: var(--radius-md);
  }
  
  &.btn-lg {
    height: 48px;
    font-size: var(--font-size-md);
    border-radius: var(--radius-md);
  }
  
  // 圓角變體 Rounded variant
  &.btn-rounded {
    border-radius: var(--radius-full);
  }
  
  // 塊級變體 Block variant
  &.btn-block {
    display: flex;
    width: 100%;
  }
  
  // 類型變體 Type variants
  &.btn-primary {
    background-color: var(--color-primary);
    color: white;
    
    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: color.adjust(#0071e3, $lightness: -5%);
    }
  }
  
  &.btn-secondary {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    
    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: color.adjust(#e5e5ea, $lightness: -5%);
    }
  }
  
  &.btn-success {
    background-color: var(--color-success);
    color: white;
    
    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: color.adjust(#34c759, $lightness: -5%);
    }
  }
  
  &.btn-warning {
    background-color: var(--color-warning);
    color: white;
    
    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: color.adjust(#ff9500, $lightness: -5%);
    }
  }
  
  &.btn-danger {
    background-color: var(--color-danger);
    color: white;
    
    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: color.adjust(#ff3b30, $lightness: -5%);
    }
  }
  
  &.btn-info {
    background-color: var(--color-info);
    color: white;
    
    &:hover:not(.btn-disabled):not(.btn-loading) {
      background-color: color.adjust(#5ac8fa, $lightness: -5%);
    }
  }
  
  // 禁用狀態 Disabled state
  &.btn-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  // 加載狀態 Loading state
  &.btn-loading {
    cursor: wait;
    
    .btn-content {
      opacity: 0.7;
    }
  }
  
  // 圖標 Icon
  .btn-icon {
    margin-right: var(--spacing-sm);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  // 加載動畫 Loading spinner
  .btn-spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
    margin-right: var(--spacing-sm);
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  // 波紋效果 Ripple effect
  &::after {
    content: '';
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    background-image: radial-gradient(circle, #fff 10%, transparent 10.01%);
    background-repeat: no-repeat;
    background-position: 50%;
    transform: scale(10, 10);
    opacity: 0;
    transition: transform 0.5s, opacity 0.5s;
  }
  
  &:active::after {
    transform: scale(0, 0);
    opacity: 0.3;
    transition: 0s;
  }
}
</style> 