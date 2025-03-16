<template>
  <div class="checkbox-group">
    <div class="checkbox-group-label" v-if="label">{{ label }}</div>
    <div class="checkbox-group-items">
      <AppCheckbox
        v-for="option in options"
        :key="option.value"
        :label="option.label"
        :model-value="isChecked(option.value)"
        :disabled="disabled"
        @update:model-value="updateValue(option.value, $event)"
      />
    </div>
    <div class="checkbox-group-error" v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import AppCheckbox from './AppCheckbox.vue';

/**
 * 多選框組組件
 * Checkbox group component
 */
export default {
  name: 'CheckboxGroup',
  components: {
    AppCheckbox
  },
  props: {
    // 多選框組標籤 Checkbox group label
    label: {
      type: String,
      default: ''
    },
    // 多選框組選項 Checkbox group options
    options: {
      type: Array,
      required: true,
      validator: (options) => options.every(option => option.value !== undefined && option.label !== undefined)
    },
    // 多選框組值 Checkbox group value (v-model)
    modelValue: {
      type: Array,
      default: () => []
    },
    // 是否禁用 Whether the checkbox group is disabled
    disabled: {
      type: Boolean,
      default: false
    },
    // 錯誤訊息 Error message
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  methods: {
    /**
     * 檢查選項是否被選中 Check if option is checked
     * @param {String|Number} value - 選項值 Option value
     * @returns {Boolean} 是否被選中 Whether the option is checked
     */
    isChecked(value) {
      return this.modelValue.includes(value);
    },
    
    /**
     * 更新多選框組值 Update checkbox group value
     * @param {String|Number} value - 選項值 Option value
     * @param {Boolean} checked - 是否選中 Whether the option is checked
     */
    updateValue(value, checked) {
      const newValue = [...this.modelValue];
      
      if (checked) {
        // 如果選中且不在數組中，則添加 If checked and not in array, add it
        if (!newValue.includes(value)) {
          newValue.push(value);
        }
      } else {
        // 如果取消選中且在數組中，則移除 If unchecked and in array, remove it
        const index = newValue.indexOf(value);
        if (index !== -1) {
          newValue.splice(index, 1);
        }
      }
      
      this.$emit('update:modelValue', newValue);
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.checkbox-group {
  margin-bottom: var(--spacing-md);
  
  .checkbox-group-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
  }
  
  .checkbox-group-items {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs);
    border: 2px solid var(--color-gray-400);
    border-radius: var(--radius-sm);
    background-color: var(--color-white);
  }
  
  .checkbox-group-error {
    margin-top: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--color-danger);
  }
}
</style> 