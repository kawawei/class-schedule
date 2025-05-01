<!-- 多日期選擇器組件 Multi Date Picker Component -->
<template>
  <div class="app-multi-date-picker">
    <!-- 月份導航 Month Navigation -->
    <div class="month-navigation">
      <button class="nav-button" @click="previousMonth">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <div class="current-month">{{ currentMonth }}</div>
      <button class="nav-button" @click="nextMonth">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <!-- 星期標題 Weekday Headers -->
    <div class="weekday-headers">
      <div v-for="day in weekDays" :key="day" class="weekday-header">
        {{ day }}
      </div>
    </div>

    <!-- 日期網格 Date Grid -->
    <div class="date-grid">
      <div 
        v-for="(date, index) in calendarDays" 
        :key="index"
        class="date-cell"
        :class="{
          'other-month': !isCurrentMonth(date),
          'today': isToday(date),
          'selected': isSelected(date)
        }"
        @click="handleDateClick(date)"
      >
        <div class="date-number">{{ formatDate(date) }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default defineComponent({
  name: 'AppMultiDatePicker',

  props: {
    // 選中的日期 Selected dates
    modelValue: {
      type: Array,
      default: () => []
    },
    // 是否禁用 Whether disabled
    disabled: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    // 當前月份 Current month
    const currentMonth = ref(new Date());

    // 星期標題 Weekday headers
    const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

    // 計算屬性 Computed properties

    // 當前月份格式化 Current month formatted
    const currentMonthFormatted = computed(() => {
      return format(currentMonth.value, 'yyyy年MM月', { locale: zhTW });
    });

    // 日曆天數 Calendar days
    const calendarDays = computed(() => {
      const monthStart = startOfMonth(currentMonth.value);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 從週一開始 Start from Monday
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      const days = [];
      let day = startDate;
      
      while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
      }
      
      return days;
    });

    // 方法 Methods

    // 檢查是否為當前月份 Check if date is in current month
    const isCurrentMonth = (date) => {
      return isSameMonth(date, currentMonth.value);
    };

    // 檢查是否為今天 Check if date is today
    const isTodayDate = (date) => {
      // 使用 date-fns 的 isToday 判斷是否為今天 Use date-fns isToday to check if date is today
      return isToday(date);
    };

    // 檢查日期是否被選中 Check if date is selected
    const isSelected = (date) => {
      return props.modelValue.some(selectedDate => isSameDay(selectedDate, date));
    };

    // 格式化日期 Format date
    const formatDate = (date) => {
      return format(date, 'd');
    };

    // 處理日期點擊 Handle date click
    const handleDateClick = (date) => {
      if (props.disabled) return;

      const newSelectedDates = [...props.modelValue];
      const index = newSelectedDates.findIndex(selectedDate => isSameDay(selectedDate, date));

      if (index === -1) {
        newSelectedDates.push(date);
      } else {
        newSelectedDates.splice(index, 1);
      }

      emit('update:modelValue', newSelectedDates);
      emit('change', newSelectedDates);
    };

    // 切換到上個月 Switch to previous month
    const previousMonth = () => {
      currentMonth.value = subMonths(currentMonth.value, 1);
    };

    // 切換到下個月 Switch to next month
    const nextMonth = () => {
      currentMonth.value = addMonths(currentMonth.value, 1);
    };

    return {
      currentMonth: currentMonthFormatted,
      weekDays,
      calendarDays,
      isCurrentMonth,
      isToday: isTodayDate,
      isSelected,
      formatDate,
      handleDateClick,
      previousMonth,
      nextMonth
    };
  }
});
</script>

<style lang="scss">
.app-multi-date-picker {
  width: 100%;
  max-width: 400px;
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-md);

  .month-navigation {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);

    .current-month {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .nav-button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: none;
      color: var(--text-secondary);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: all 0.2s;

      &:hover {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }

  .weekday-headers {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--spacing-xs);
    margin-bottom: var(--spacing-sm);

    .weekday-header {
      text-align: center;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      padding: var(--spacing-xs);
    }
  }

  .date-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--spacing-xs);

    .date-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: var(--bg-secondary);
      }

      &.other-month {
        opacity: 0.5;
      }

      &.today {
        .date-number {
          color: var(--color-primary);
          font-weight: var(--font-weight-bold);
        }
      }

      &.selected {
        background-color: var(--color-primary);
        
        .date-number {
          color: white !important;
          font-weight: var(--font-weight-bold);
        }

        &:hover {
          background-color: var(--color-primary-dark);
        }
      }

      .date-number {
        font-size: var(--font-size-sm);
        color: var(--text-primary);
      }
    }
  }
}
</style> 