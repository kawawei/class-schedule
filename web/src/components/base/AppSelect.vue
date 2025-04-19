<template>
  <div class="app-select-wrapper" :class="{ 'has-error': error }">
    <label v-if="label" class="select-label" :for="id">{{ label }}</label>
    <div class="select-container" @click="toggleDropdown">
      <input
        v-if="searchable"
        ref="searchInput"
        v-model="searchQuery"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="app-select"
        @focus="handleFocus"
        @blur="handleBlurDelayed"
        @input="handleSearch"
      />
      <select
        v-else
        :id="id"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="app-select"
        @change="updateValue"
        @focus="handleFocus"
        @blur="handleBlur"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <div class="select-arrow"></div>
      
      <!-- 下拉選單 Dropdown menu -->
      <div v-if="searchable && isOpen" class="select-dropdown">
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          class="select-option"
          :class="{ 'selected': option.value === modelValue }"
          @mousedown.prevent="selectOption(option)"
        >
          {{ option.label }}
        </div>
        <div v-if="filteredOptions.length === 0" class="select-no-results">
          無符合結果 / No results found
        </div>
      </div>
    </div>
    <p v-if="error" class="select-error">{{ error }}</p>
  </div>
</template>

<script>
/**
 * 下拉選單組件
 * Select component
 */
export default {
  name: 'AppSelect',
  props: {
    // 選單ID Select ID
    id: {
      type: String,
      default() {
        return `select-${Math.random().toString(36).substring(2, 9)}`;
      }
    },
    // 選單標籤 Select label
    label: {
      type: String,
      default: ''
    },
    // 選單值 Select value (v-model)
    modelValue: {
      type: [String, Number],
      default: ''
    },
    // 選單選項 Select options
    options: {
      type: Array,
      required: true,
      validator: (options) => options.every(option => option.value !== undefined && option.label !== undefined)
    },
    // 選單佔位符 Select placeholder
    placeholder: {
      type: String,
      default: ''
    },
    // 是否禁用 Whether the select is disabled
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否必填 Whether the select is required
    required: {
      type: Boolean,
      default: false
    },
    // 錯誤訊息 Error message
    error: {
      type: String,
      default: ''
    },
    // 是否可搜尋 Whether the select is searchable
    searchable: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'focus', 'blur', 'search'],
  
  data() {
    return {
      isOpen: false,
      searchQuery: '',
      selectedLabel: ''
    }
  },
  
  computed: {
    /**
     * 過濾後的選項 Filtered options
     * @returns {Array} 過濾後的選項列表 Filtered options list
     */
    filteredOptions() {
      if (!this.searchQuery) return this.options;
      
      const query = this.searchQuery.toLowerCase();
      return this.options.filter(option =>
        option.label.toLowerCase().includes(query)
      );
    }
  },
  
  watch: {
    /**
     * 監聽選中值變化 Watch modelValue changes
     */
    modelValue: {
      immediate: true,
      handler(newValue) {
        const option = this.options.find(opt => opt.value === newValue);
        if (option) {
          this.searchQuery = option.label;
          this.selectedLabel = option.label;
        }
      }
    }
  },
  
  methods: {
    /**
     * 更新選單值 Update select value
     * @param {Event} event - 變更事件 Change event
     */
    updateValue(event) {
      this.$emit('update:modelValue', event.target.value);
    },
    
    /**
     * 處理聚焦事件 Handle focus event
     * @param {Event} event - 聚焦事件 Focus event
     */
    handleFocus(event) {
      this.$emit('focus', event);
    },
    
    /**
     * 處理失焦事件 Handle blur event
     * @param {Event} event - 失焦事件 Blur event
     */
    handleBlur(event) {
      this.$emit('blur', event);
    },
    
    /**
     * 切換下拉選單 Toggle dropdown
     */
    toggleDropdown() {
      if (!this.disabled) {
        this.isOpen = !this.isOpen;
      }
    },
    
    /**
     * 處理搜尋 Handle search
     */
    handleSearch() {
      this.isOpen = true;
      this.$emit('search', this.searchQuery);
    },
    
    /**
     * 選擇選項 Select option
     * @param {Object} option - 選中的選項 Selected option
     */
    selectOption(option) {
      this.searchQuery = option.label;
      this.selectedLabel = option.label;
      this.$emit('update:modelValue', option.value);
      this.isOpen = false;
    },
    
    /**
     * 延遲處理失焦事件 Handle blur with delay
     */
    handleBlurDelayed() {
      setTimeout(() => {
        this.isOpen = false;
        if (!this.options.some(opt => opt.label === this.searchQuery)) {
          this.searchQuery = this.selectedLabel;
        }
        this.handleBlur();
      }, 200);
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-select-wrapper {
  margin-bottom: var(--spacing-md);
  width: 100%;
  
  &.has-error {
    .app-select {
      border-color: var(--color-danger);
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.2);
      }
    }
  }
}

.select-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.select-container {
  position: relative;
  display: flex;
  align-items: center;
}

.app-select {
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-md);
  padding-right: 35px;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid #000000;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    border-width: 2px;
    box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
  }
  
  &:hover {
    background-color: var(--color-gray-50);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    background-color: var(--bg-tertiary);
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &::placeholder {
    color: var(--text-tertiary);
  }
}

.select-arrow {
  position: absolute;
  right: 15px;
  width: 8px;
  height: 8px;
  border-right: 2px solid #000;
  border-bottom: 2px solid #000;
  pointer-events: none;
  transform: translateY(-50%) rotate(45deg);
  top: 50%;
  transition: transform 0.3s ease;
  
  .select-container:hover & {
    transform: translateY(-50%) rotate(45deg) scale(1.2);
  }
}

.select-error {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

.select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  margin-top: 4px;
  background-color: var(--bg-primary);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  z-index: 1000;
}

.select-option {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--color-gray-100);
  }
  
  &.selected {
    background-color: var(--color-primary-light);
    color: var(--color-primary);
  }
}

.select-no-results {
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-tertiary);
  text-align: center;
}

.app-select {
  &[type="text"] {
    cursor: text;
  }
}
</style> 