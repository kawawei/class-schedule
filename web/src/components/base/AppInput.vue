<template>
  <div class="app-input-wrapper" :class="{ 'has-error': error }">
    <label v-if="label" class="input-label" :for="id">{{ label }}</label>
    <div class="input-container">
      <input
        v-if="type !== 'textarea'"
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        class="app-input"
        @input="updateValue"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <textarea
        v-else
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        class="app-textarea"
        @input="updateValue"
        @focus="handleFocus"
        @blur="handleBlur"
      ></textarea>
      <div v-if="type === 'password'" class="input-icon" @click="togglePasswordVisibility">
        <svg v-if="!passwordVisible" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      </div>
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  name: 'AppInput',
  props: {
    // 輸入框ID Input ID
    id: {
      type: String,
      default() {
        return `input-${Math.random().toString(36).substring(2, 9)}`;
      }
    },
    // 輸入框標籤 Input label
    label: {
      type: String,
      default: ''
    },
    // 輸入框類型 Input type
    type: {
      type: String,
      default: 'text',
      validator: (value) => [
        'text',
        'password',
        'email',
        'number',
        'tel',
        'url',
        'textarea',
        'time',
        'date'
      ].includes(value)
    },
    // 輸入框值 Input value (v-model)
    modelValue: {
      type: [String, Number],
      default: ''
    },
    // 輸入框佔位符 Input placeholder
    placeholder: {
      type: String,
      default: ''
    },
    // 是否禁用 Whether the input is disabled
    disabled: {
      type: Boolean,
      default: false
    },
    // 是否必填 Whether the input is required
    required: {
      type: Boolean,
      default: false
    },
    // 自動完成 Autocomplete attribute
    autocomplete: {
      type: String,
      default: 'off'
    },
    // 錯誤訊息 Error message
    error: {
      type: String,
      default: ''
    },
    // 文本區域行數 Textarea rows
    rows: {
      type: [Number, String],
      default: 3
    }
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  data() {
    return {
      // 密碼是否可見 Whether the password is visible
      passwordVisible: false
    };
  },
  methods: {
    /**
     * 更新輸入值 Update input value
     * @param {Event} event - 輸入事件 Input event
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
     * 切換密碼可見性 Toggle password visibility
     */
    togglePasswordVisibility() {
      if (this.type === 'password') {
        this.passwordVisible = !this.passwordVisible;
        const input = document.getElementById(this.id);
        input.type = this.passwordVisible ? 'text' : 'password';
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-input-wrapper {
  margin-bottom: var(--spacing-md);
  width: 100%;
  
  &.has-error {
    .app-input {
      border-color: var(--color-danger);
      
      &:focus {
        box-shadow: 0 0 0 2px rgba(255, 59, 48, 0.2);
      }
    }
  }
}

.input-label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.app-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--spacing-md);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
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

.input-icon {
  position: absolute;
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  
  &:hover {
    color: var(--text-primary);
  }
}

.input-error {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-danger);
}

.app-textarea {
  width: 100%;
  min-height: 80px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(0, 113, 227, 0.2);
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
</style> 