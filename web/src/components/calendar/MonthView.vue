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
            'weekend': dayIndex >= 5,
            'selected': isSelectedDate(day.date)
          }"
          @click="handleDayClick(day.date)"
          @dragover.prevent
          @dragenter="handleDragEnter($event)"
          @dragleave="handleDragLeave($event)"
          @drop="handleDrop($event, day.date)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          
          <!-- 事件列表容器 Event list container -->
          <div class="day-events-container">
            <div class="day-events">
              <ScheduleBlock
                v-for="(event, eventIndex) in getSortedEventsForDay(day.date)"
                :key="`${event.id}-${event.date}-${event.startTime}`"
                :start-time="event.startTime"
                :end-time="event.endTime"
                :course-type="event.courseType"
                :school-name="event.schoolName"
                :teacher-name="event.teacherName"
                :assistant-name="event.assistantName"
                :position="event.position"
                :course-id="event.id"
                :uuid="event.uuid"
                :district="event.district"
                :county="event.county"
                :class-name="event.className"
                :course-fee="event.courseFee"
                :teacher-fee="event.teacherFee"
                :assistant-fee="event.assistantFee"
                :hourly-rate="event.hourlyRate"
                :notes="event.notes"
                :date="event.date"
                class="month-schedule-block"
                @click="handleScheduleBlockClick($event, event)"
                @dragstart="handleDragStart"
                @dragend="handleDragEnd"
              />
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
import { defineComponent, computed, ref, watch } from 'vue';
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
  parseISO,
  eachDayOfInterval
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import ScheduleBlock from '@/components/schedule/ScheduleBlock.vue';
import courseDataService from '@/services/courseDataService';

export default defineComponent({
  name: 'MonthView',
  
  components: {
    ScheduleBlock
  },
  
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
  
  emits: ['event-click', 'date-click', 'course-move', 'dragstart', 'dragend'],
  
  setup(props, { emit }) {
    // 星期標題 Weekday headers (英文) English weekday headers
    const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    
    // 更多事件對話框狀態 More events dialog state
    const moreEventsDialogVisible = ref(false);
    const selectedDay = ref(null);
    
    // 添加選中日期狀態 Add selected date state
    const selectedDate = ref(null);
    
    // 添加拖曳狀態 Add drag state
    const isDragging = ref(false);

    // 監聽 events 變化，更新 courseDataService
    // Watch for events changes and update courseDataService
    watch(() => props.events, (newEvents) => {
      if (newEvents && newEvents.length > 0) {
        courseDataService.setCourses(newEvents);
      }
    }, { immediate: true });
    
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
    
    // 檢查日期是否被選中 Check if date is selected
    const isSelectedDate = (date) => {
      return selectedDate.value && isSameDay(date, selectedDate.value);
    };
    
    // 方法 Methods
    
    // 獲取指定日期的事件 Get events for specific day
    const getEventsForDay = (date) => {
      return props.events.filter(event => {
        // 將事件的日期和時間組合成完整的日期時間 Combine event date and time into full datetime
        if (!event.date) return false;
        const eventDate = parseISO(event.date);
        return isSameDay(eventDate, date);
      });
    };
    
    // 格式化事件時間 Format event time
    const formatEventTime = (event) => {
      return `${event.startTime} - ${event.endTime}`;
    };
    
    // 修改處理日期點擊事件 Modify day click handler
    const handleDayClick = (date) => {
      selectedDate.value = date;
      emit('date-click', date);
    };
    
    // 處理課程方塊點擊 Handle schedule block click
    const handleScheduleBlockClick = (event, scheduleEvent) => {
      // 阻止事件冒泡到日期單元格 Prevent event bubbling to date cell
      event?.preventDefault?.();
      // 發出事件點擊事件 Emit event click event
      handleEventClick(scheduleEvent);
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
    
    // 獲取排序後的事件 Get sorted events for a day
    const getSortedEventsForDay = (date) => {
      const events = getEventsForDay(date);
      return events.sort((a, b) => {
        // 先比較開始時間 Compare start times first
        const [aHours, aMinutes] = a.startTime.split(':').map(Number);
        const [bHours, bMinutes] = b.startTime.split(':').map(Number);
        const aTime = aHours * 60 + aMinutes;
        const bTime = bHours * 60 + bMinutes;
        
        if (aTime !== bTime) {
          return aTime - bTime;
        }
        
        // 如果開始時間相同，比較結束時間 If start times are same, compare end times
        const [aEndHours, aEndMinutes] = a.endTime.split(':').map(Number);
        const [bEndHours, bEndMinutes] = b.endTime.split(':').map(Number);
        const aEndTime = aEndHours * 60 + aEndMinutes;
        const bEndTime = bEndHours * 60 + bEndMinutes;
        
        if (aEndTime !== bEndTime) {
          return aEndTime - bEndTime;
        }
        
        // 如果時間都相同，比較課程ID If times are same, compare course IDs
        return a.id - b.id;
      });
    };
    
    // 將時間轉換為分鐘數 Convert time to minutes
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    // 處理拖曳開始 Handle drag start
    const handleDragStart = (event) => {
      isDragging.value = true;
      // 確保清除所有之前的 dragover 效果
      // Clear all previous dragover effects
      document.querySelectorAll('.dragover').forEach(element => {
        element.classList.remove('dragover');
      });
      emit('dragstart', event);
    };
    
    // 處理拖曳結束 Handle drag end
    const handleDragEnd = (event) => {
      // 移除所有具有 dragover 類的元素
      // Remove dragover class from all elements
      document.querySelectorAll('.dragover').forEach(element => {
        element.classList.remove('dragover');
      });
      
      isDragging.value = false;
      emit('dragend', event);
    };
    
    // 處理拖曳進入 Handle drag enter
    const handleDragEnter = (event) => {
      event.preventDefault();
      // 先清除其他元素的 dragover 效果
      // Clear dragover effect from other elements first
      document.querySelectorAll('.dragover').forEach(element => {
        if (element !== event.currentTarget) {
          element.classList.remove('dragover');
        }
      });
      // 只有在拖曳狀態時才添加效果
      // Only add effect when dragging
      if (isDragging.value) {
        event.currentTarget.classList.add('dragover');
      }
    };

    // 處理拖曳離開 Handle drag leave
    const handleDragLeave = (event) => {
      event.preventDefault();
      // 確保只移除當前元素的效果
      // Make sure to only remove effect from current element
      if (event.currentTarget.contains(event.relatedTarget)) {
        return; // 如果是子元素，不處理 If it's a child element, do nothing
      }
      event.currentTarget.classList.remove('dragover');
    };
    
    // 處理拖放 Handle drop
    const handleDrop = (event, targetDate) => {
      event.preventDefault();
      // 清除所有 dragover 效果
      // Clear all dragover effects
      document.querySelectorAll('.dragover').forEach(element => {
        element.classList.remove('dragover');
      });
      isDragging.value = false;
      
      try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const targetDateStr = format(targetDate, 'yyyy-MM-dd');
        
        // 如果目標日期與源日期相同，不處理
        if (targetDateStr === data.date) return;
        
        // 觸發課程移動事件 Emit course move event
        emit('course-move', {
          courseId: data.courseId,
          uuid: data.uuid,
          sourceDate: data.date,
          targetDate: targetDateStr,
          isCopy: event.ctrlKey || event.metaKey
        });
      } catch (error) {
        console.error('處理拖放失敗 Handle drop failed:', error);
      }
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
      isSelectedDate,
      selectedDate,
      isDragging,
      handleDayClick,
      handleScheduleBlockClick,
      handleEventClick,
      handleMoreEventsClick,
      getSortedEventsForDay,
      timeToMinutes,
      handleDragStart,
      handleDragEnd,
      handleDragEnter,
      handleDragLeave,
      handleDrop
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
  padding: 0;
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
  border-left: 1px solid #E5E5E5;
  border-top: 1px solid #E5E5E5;
  
  .week-row {
    display: flex;
    flex: 1;
    min-height: 100px;
    
    .day-cell {
      flex: 1;
      min-height: 100px;
      border-right: 1px solid #E5E5E5;
      border-bottom: 1px solid #E5E5E5;
      padding: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      display: flex;
      flex-direction: column;
      background-color: white;
      
      &:not(:first-child) {
        border-left: none; // 除了第一格外，移除左邊框 Remove left border except for first cell
      }
      
      &:hover {
        background-color: var(--bg-hover);
        z-index: 1;
      }
      
      // 添加拖曳時的視覺反饋 Add visual feedback during drag
      &.dragover {
        outline: 2px dashed var(--color-primary);
        outline-offset: -2px;
        background-color: rgba(24, 144, 255, 0.05);
        z-index: 2;
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
          color: #e74c3c;
        }
        
        &.today .day-number {
          background-color: #e74c3c;
          color: white;
        }
      }
      
      &.selected {
        .day-number {
          background-color: rgba(0, 113, 227, 0.1);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
        }
      }
      
      .day-number {
        display: inline-block;
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        border-radius: 50%;
        font-size: var(--font-size-md);
        margin: 2px;
      }
      
      .day-events-container {
        flex: 1;
        overflow: hidden;
        position: relative;

        .day-events {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow-y: auto;
          padding-right: var(--spacing-xs); // 為滾動條預留空間
          
          /* 自定義滾動條樣式 Custom scrollbar styles */
          &::-webkit-scrollbar {
            width: 4px;
          }
          
          &::-webkit-scrollbar-track {
            background: transparent;
          }
          
          &::-webkit-scrollbar-thumb {
            background: var(--color-gray-300);
            border-radius: 2px;
          }

          .month-schedule-block {
            margin-bottom: 2px; // 方塊之間的間距
            
            &:last-child {
              margin-bottom: 0;
            }
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