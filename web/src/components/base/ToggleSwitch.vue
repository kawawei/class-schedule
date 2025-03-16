<template>
  <div 
    class="toggle-switch" 
    :class="{ 'is-active': modelValue, 'is-disabled': disabled }"
    @click="toggleValue"
  >
    <div class="toggle-switch-track">
      <span class="toggle-text toggle-text-active">啟用</span>
      <span class="toggle-text toggle-text-inactive">停用</span>
    </div>
    <div class="toggle-switch-thumb"></div>
  </div>
</template>

<script>
/**
 * 開關按鈕組件
 * Toggle switch component
 */
export default {
  name: 'ToggleSwitch',
  props: {
    // 開關值 Toggle value (v-model)
    modelValue: {
      type: Boolean,
      default: false
    },
    // 是否禁用 Whether the toggle is disabled
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    /**
     * 切換開關值 Toggle switch value
     */
    toggleValue() {
      if (this.disabled) return;
      
      const newValue = !this.modelValue;
      this.$emit('update:modelValue', newValue);
      this.$emit('change', newValue);
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.toggle-switch {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  
  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.toggle-switch-track {
  position: relative;
  width: 70px;
  height: 26px;
  background-color: #ff4d4f; // 停用時為紅色 Red color when inactive
  border-radius: 13px;
  transition: all 0.3s ease;
  overflow: hidden;
  
  .is-active & {
    background-color: #52c41a; // 啟用時為綠色 Green color when active
  }
}

.toggle-text {
  position: absolute;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-text-active {
  left: 8px;
  color: white;
  opacity: 0;
  
  .is-active & {
    opacity: 1;
  }
}

.toggle-text-inactive {
  right: 8px;
  color: white; // 文字顏色改為白色 Text color changed to white
  opacity: 1;
  
  .is-active & {
    opacity: 0;
  }
}

.toggle-switch-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  
  .is-active & {
    transform: translateX(44px);
  }
}
</style> 