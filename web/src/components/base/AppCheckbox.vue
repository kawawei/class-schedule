<template>
  <div class="app-checkbox-wrapper">
    <label class="app-checkbox">
      <input
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        @change="updateValue"
      />
      <span class="checkbox-custom"></span>
      <span class="checkbox-label">{{ label }}</span>
    </label>
  </div>
</template>

<script>
/**
 * 多選框組件
 * Checkbox component
 */
export default {
  name: 'AppCheckbox',
  props: {
    // 多選框標籤 Checkbox label
    label: {
      type: String,
      default: ''
    },
    // 多選框值 Checkbox value (v-model)
    modelValue: {
      type: Boolean,
      default: false
    },
    // 是否禁用 Whether the checkbox is disabled
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  methods: {
    /**
     * 更新多選框值 Update checkbox value
     * @param {Event} event - 變更事件 Change event
     */
    updateValue(event) {
      this.$emit('update:modelValue', event.target.checked);
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-checkbox-wrapper {
  margin-bottom: var(--spacing-sm);
}

.app-checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  
  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
    
    &:checked ~ .checkbox-custom {
      background-color: var(--color-primary);
      border-color: var(--color-primary);
      
      &:after {
        display: block;
      }
    }
    
    &:disabled ~ .checkbox-custom {
      background-color: var(--color-gray-200);
      border-color: var(--color-gray-300);
      cursor: not-allowed;
    }
    
    &:disabled ~ .checkbox-label {
      color: var(--color-gray-400);
      cursor: not-allowed;
    }
  }
  
  .checkbox-custom {
    position: relative;
    height: 18px;
    width: 18px;
    background-color: var(--color-white);
    border: 1px solid #000000;
    border-radius: var(--radius-sm);
    margin-right: var(--spacing-sm);
    transition: all 0.2s ease;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    
    &:after {
      content: "";
      position: absolute;
      display: none;
      left: 5px;
      top: 1px;
      width: 5px;
      height: 10px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }
  
  .checkbox-label {
    font-size: var(--font-size-md);
    color: var(--text-primary);
  }
  
  &:hover input ~ .checkbox-custom {
    border-color: var(--color-primary);
    border-width: 2px;
  }
}
</style> 