<!-- 日期範圍選擇器組件 Date Range Picker Component -->
<template>
  <div class="app-date-range-picker">
    <!-- 快速選擇按鈕 Quick Select Buttons -->
    <div class="quick-select-buttons">
      <button 
        v-for="(option, index) in quickSelectOptions" 
        :key="index"
        class="quick-select-btn"
        :class="{ active: isActive(option.value) }"
        @click="handleQuickSelect(option.value)"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- 日期輸入框 Date Inputs -->
    <div v-if="showDateInputs" class="date-inputs">
      <div class="date-input">
        <AppInput
          v-model="startDateModel"
          type="date"
          :placeholder="startPlaceholder"
          :disabled="disabled"
          @change="handleStartDateChange"
        />
      </div>

      <div class="date-separator">至</div>

      <div class="date-input">
        <AppInput
          v-model="endDateModel"
          type="date"
          :placeholder="endPlaceholder"
          :disabled="disabled"
          :min="startDateModel"
          @change="handleEndDateChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue';
import AppInput from './AppInput.vue';
import { addDays, startOfDay, endOfDay, startOfMonth, endOfMonth, format, parse, isSameDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default defineComponent({
  name: 'AppDateRangePicker',

  components: {
    AppInput
  },

  props: {
    // 日期範圍值 Date range value
    modelValue: {
      type: Object,
      default: () => ({
        startDate: '',
        endDate: ''
      })
    },
    // 是否禁用 Whether disabled
    disabled: {
      type: Boolean,
      default: false
    },
    // 開始日期佔位符 Start date placeholder
    startPlaceholder: {
      type: String,
      default: '開始日期'
    },
    // 結束日期佔位符 End date placeholder
    endPlaceholder: {
      type: String,
      default: '結束日期'
    },
    // 是否顯示日期輸入框 Whether to show date inputs
    showDateInputs: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    // 開始日期模型 Start date model
    const startDateModel = ref(props.modelValue.startDate);
    // 結束日期模型 End date model
    const endDateModel = ref(props.modelValue.endDate);
    // 當前選中的快速選擇項 Current selected quick option
    const currentQuickOption = ref('');

    // 快速選擇選項 Quick select options
    const quickSelectOptions = [
      { label: '今天', value: 'today' },
      { label: '最近7天', value: 'last7days' },
      { label: '最近30天', value: 'last30days' },
      { label: '本月', value: 'thisMonth' }
    ];

    // 檢查是否為當前選中的選項 Check if option is currently active
    const isActive = (value) => {
      return currentQuickOption.value === value;
    };

    // 監聽外部值變化 Watch external value changes
    watch(() => props.modelValue, (newValue) => {
      startDateModel.value = newValue.startDate;
      endDateModel.value = newValue.endDate;
    }, { deep: true });

    // 處理開始日期變化 Handle start date change
    const handleStartDateChange = () => {
      if (endDateModel.value && startDateModel.value > endDateModel.value) {
        endDateModel.value = startDateModel.value;
      }
      currentQuickOption.value = '';
      emitChange();
    };

    // 處理結束日期變化 Handle end date change
    const handleEndDateChange = () => {
      if (startDateModel.value && endDateModel.value < startDateModel.value) {
        startDateModel.value = endDateModel.value;
      }
      currentQuickOption.value = '';
      emitChange();
    };

    // 處理快速選擇 Handle quick select
    const handleQuickSelect = (type) => {
      const today = new Date();
      const startOfToday = startOfDay(today);
      
      currentQuickOption.value = type;
      
      switch (type) {
        case 'today':
          startDateModel.value = format(startOfToday, 'yyyy-MM-dd');
          endDateModel.value = format(endOfDay(today), 'yyyy-MM-dd');
          break;
        case 'last7days':
          startDateModel.value = format(addDays(startOfToday, -6), 'yyyy-MM-dd');
          endDateModel.value = format(today, 'yyyy-MM-dd');
          break;
        case 'last30days':
          startDateModel.value = format(addDays(startOfToday, -29), 'yyyy-MM-dd');
          endDateModel.value = format(today, 'yyyy-MM-dd');
          break;
        case 'thisMonth':
          const firstDayOfMonth = startOfMonth(today);
          const lastDayOfMonth = endOfMonth(today);
          startDateModel.value = format(firstDayOfMonth, 'yyyy-MM-dd');
          endDateModel.value = format(lastDayOfMonth, 'yyyy-MM-dd');
          break;
      }
      emitChange();
    };

    // 發出變更事件 Emit change event
    const emitChange = () => {
      const value = {
        startDate: startDateModel.value,
        endDate: endDateModel.value
      };
      emit('update:modelValue', value);
      emit('change', value);
    };

    return {
      startDateModel,
      endDateModel,
      quickSelectOptions,
      handleStartDateChange,
      handleEndDateChange,
      handleQuickSelect,
      isActive
    };
  }
});
</script>

<style lang="scss" scoped>
.app-date-range-picker {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  
  .quick-select-buttons {
    display: flex;
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-xs);
    
    .quick-select-btn {
      padding: var(--spacing-xs) var(--spacing-sm);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      height: 32px;
      display: flex;
      align-items: center;
      
      &:hover {
        background: var(--bg-secondary);
        border-color: var(--border-color-hover);
        color: var(--text-primary);
      }
      
      &.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }
    }
  }
  
  .date-inputs {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    .date-input {
      flex: 1;
      min-width: 130px;

      :deep(.app-input) {
        height: 32px;
      }
    }
    
    .date-separator {
      color: var(--text-secondary);
      padding: 0 var(--spacing-xs);
      font-size: var(--font-size-sm);
    }
  }
}

// 響應式設計 Responsive design
@media (max-width: 768px) {
  .app-date-range-picker {
    .quick-select-buttons {
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    
    .date-inputs {
      flex-direction: column;
      align-items: stretch;
      
      .date-separator {
        text-align: center;
        padding: var(--spacing-xs) 0;
      }
    }
  }
}
</style> 