<template>
  <div class="month-view">
    <!-- 星期標題行 Weekday header row -->
    <div class="month-header">
      <div 
        v-for="(day, index) in weekDays" 
        :key="index" 
        class="weekday-header"
        :class="{ 'weekend': index >= 5 }"
      >
        {{ day }}
      </div>
    </div>
    
    <!-- 月曆網格 Month grid -->
    <div class="month-grid">
      <div 
        v-for="(week, weekIndex) in calendarDays" 
        :key="`week-${weekIndex}`" 
        class="week-row"
      >
        <div 
          v-for="(day, dayIndex) in week" 
          :key="`day-${weekIndex}-${dayIndex}`" 
          class="day-cell"
          :class="{
            'current-month': day.currentMonth,
            'other-month': !day.currentMonth,
            'today': day.isToday,
            'has-events': getEventsForDay(day.date).length > 0,
            'weekend': dayIndex >= 5
          }"
          @click="handleDayClick(day.date)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          
          <!-- 事件列表 Event list -->
          <div class="day-events">
            <div 
              v-for="(event, eventIndex) in getEventsForDay(day.date).slice(0, 3)" 
              :key="`event-${eventIndex}`" 
              class="event-pill"
              @click.stop="handleEventClick(event)"
            >
              {{ event.title }}
            </div>
            
            <!-- 更多事件指示器 More events indicator -->
            <div 
              v-if="getEventsForDay(day.date).length > 3" 
              class="more-events"
              @click.stop="handleMoreEventsClick(day.date)"
            >
              +{{ getEventsForDay(day.date).length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 更多事件彈出框 More events popup -->
    <dialog
      v-if="selectedDay"
      :open="moreEventsDialogVisible"
      class="events-dialog"
    >
      <div class="dialog-header">
        <h3>{{ formatSelectedDay }}</h3>
        <button class="close-button" @click="moreEventsDialogVisible = false">×</button>
      </div>
      <div class="events-list">
        <div 
          v-for="(event, index) in selectedDayEvents" 
          :key="`popup-event-${index}`" 
          class="event-item"
          @click="handleEventClick(event)"
        >
          <div class="event-time">{{ formatEventTime(event) }}</div>
          <div class="event-title">{{ event.title }}</div>
          <div class="event-location" v-if="event.location">{{ event.location }}</div>
        </div>
        
        <div v-if="selectedDayEvents.length === 0" class="no-events">
          No events
        </div>
      </div>
    </dialog>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from 'vue';
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
  parseISO
} from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default defineComponent({
  name: 'MonthView',
  
  props: {
    // 當前日期 Current date
    currentDate: {
      type: Date,
      required: true
    },
    // 課程事件 Course events
    events: {
      type: Array,
      default: () => []
    }
  },
  
  emits: ['event-click', 'date-click'],
  
  setup(props, { emit }) {
    // 星期標題 Weekday headers (英文) English weekday headers
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    // 更多事件對話框狀態 More events dialog state
    const moreEventsDialogVisible = ref(false);
    const selectedDay = ref(null);
    
    // 計算屬性 Computed properties
    
    // 日曆天數 Calendar days
    const calendarDays = computed(() => {
      const monthStart = startOfMonth(props.currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 從週一開始 Start from Monday
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      const days = [];
      let day = startDate;
      
      // 創建週數組 Create weeks array
      while (day <= endDate) {
        const week = [];
        
        // 創建每週的天數組 Create days array for each week
        for (let i = 0; i < 7; i++) {
          week.push({
            date: day,
            dayNumber: format(day, 'd'),
            currentMonth: isSameMonth(day, monthStart),
            isToday: isToday(day)
          });
          
          day = addDays(day, 1);
        }
        
        days.push(week);
      }
      
      return days;
    });
    
    // 選中日期的事件 Events for selected day
    const selectedDayEvents = computed(() => {
      if (!selectedDay.value) return [];
      
      return getEventsForDay(selectedDay.value);
    });
    
    // 格式化選中日期 Format selected day
    const formatSelectedDay = computed(() => {
      if (!selectedDay.value) return '';
      
      return format(selectedDay.value, 'yyyy/MM/dd EEEE', { locale: zhTW });
    });
    
    // 方法 Methods
    
    // 獲取指定日期的事件 Get events for specific day
    const getEventsForDay = (date) => {
      return props.events.filter(event => {
        const eventStart = event.start instanceof Date ? event.start : parseISO(event.start);
        return isSameDay(eventStart, date);
      });
    };
    
    // 格式化事件時間 Format event time
    const formatEventTime = (event) => {
      const eventStart = event.start instanceof Date ? event.start : parseISO(event.start);
      const eventEnd = event.end instanceof Date ? event.end : parseISO(event.end);
      
      return `${format(eventStart, 'HH:mm')} - ${format(eventEnd, 'HH:mm')}`;
    };
    
    // 處理日期點擊 Handle day click
    const handleDayClick = (date) => {
      emit('date-click', date);
    };
    
    // 處理事件點擊 Handle event click
    const handleEventClick = (event) => {
      moreEventsDialogVisible.value = false;
      emit('event-click', event);
    };
    
    // 處理更多事件點擊 Handle more events click
    const handleMoreEventsClick = (date) => {
      selectedDay.value = date;
      moreEventsDialogVisible.value = true;
      
      // 使用原生 dialog 元素的 showModal 方法顯示對話框
      // Use the native dialog element's showModal method to show the dialog
      setTimeout(() => {
        const dialog = document.querySelector('.events-dialog');
        if (dialog && typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      }, 0);
    };
    
    return {
      weekDays,
      calendarDays,
      moreEventsDialogVisible,
      selectedDay,
      selectedDayEvents,
      formatSelectedDay,
      getEventsForDay,
      formatEventTime,
      handleDayClick,
      handleEventClick,
      handleMoreEventsClick
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.month-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f9f9f9;
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.month-header {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  
  .weekday-header {
    flex: 1;
    text-align: center;
    padding: var(--spacing-md) 0;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    
    &.weekend {
      color: #e74c3c; // 紅色 Red color for weekends
    }
  }
}

.month-grid {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--color-white);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  
  .week-row {
    display: flex;
    flex: 1; // 使用 flex: 1 讓每行平均分配容器高度
    
    .day-cell {
      flex: 1;
      // 移除最小高度，讓日期格子根據週行的高度自動調整
      // Remove minimum height to let date cells adjust automatically based on week row height
      border-right: 1px solid var(--color-gray-200);
      border-bottom: 1px solid var(--color-gray-200);
      padding: var(--spacing-xs);
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      display: flex; // 使用 flex 布局
      flex-direction: column; // 垂直排列
      
      &:first-child {
        border-left: 1px solid var(--color-gray-200);
      }
      
      &:hover {
        background-color: rgba(0, 113, 227, 0.05);
      }
      
      &.current-month {
        background-color: var(--color-white);
      }
      
      &.other-month {
        background-color: var(--color-gray-50);
        color: var(--text-tertiary);
      }
      
      &.today {
        .day-number {
          background-color: var(--color-primary);
          color: white;
        }
      }
      
      &.has-events {
        .day-number {
          font-weight: var(--font-weight-bold);
        }
      }
      
      &.weekend {
        .day-number {
          color: #e74c3c; // 紅色 Red color for weekends
        }
        
        &.today .day-number {
          background-color: #e74c3c;
          color: white;
        }
      }
      
      .day-number {
        display: inline-block;
        width: 28px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        border-radius: 50%;
        font-size: var(--font-size-md);
        margin-bottom: var(--spacing-xs);
      }
      
      .day-events {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1; // 讓事件列表佔據剩餘空間
        overflow-y: auto; // 如果事件太多，允許滾動
        
        .event-pill {
          background-color: rgba(0, 113, 227, 0.1);
          border-left: 3px solid var(--color-primary);
          border-radius: var(--radius-sm);
          padding: 2px var(--spacing-xs);
          font-size: var(--font-size-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          
          &:hover {
            background-color: rgba(0, 113, 227, 0.15);
            transform: translateY(-1px);
            box-shadow: var(--shadow-xs);
          }
        }
        
        .more-events {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          text-align: center;
          padding: 2px;
          cursor: pointer;
          
          &:hover {
            color: var(--color-primary);
            text-decoration: underline;
          }
        }
      }
    }
  }
}

.events-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--color-white);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 0;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  border: none;
  z-index: 1000;
  
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
  }
  
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-gray-200);
    
    h3 {
      margin: 0;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
    }
    
    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
      
      &:hover {
        color: var(--text-primary);
      }
    }
  }
}

.events-list {
  max-height: 400px;
  overflow-y: auto;
  
  .event-item {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-gray-200);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: rgba(0, 113, 227, 0.05);
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    .event-time {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }
    
    .event-title {
      font-weight: var(--font-weight-medium);
      font-size: var(--font-size-md);
      margin-bottom: var(--spacing-xs);
    }
    
    .event-location {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
  }
  
  .no-events {
    padding: var(--spacing-md);
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--font-size-md);
  }
}
</style> 