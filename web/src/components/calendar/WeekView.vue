<template>
  <div class="week-view">
    <!-- 星期標題行 Weekday header row -->
    <div class="week-header">
      <div class="time-column-header"></div>
      <div 
        v-for="(day, index) in weekDays" 
        :key="index" 
        class="day-column-header"
        :class="{ 'current-day': isCurrentDay(day.date) }"
      >
        <div class="day-name">{{ day.dayName }}</div>
        <div class="day-number">{{ day.dayNumber }}</div>
      </div>
    </div>
    
    <!-- 時間網格 Time grid -->
    <div class="week-grid">
      <!-- 時間軸 Time axis -->
      <div class="time-axis">
        <div 
          v-for="hour in hours" 
          :key="hour" 
          class="time-slot"
        >
          <span class="time-label">{{ formatHour(hour) }}</span>
        </div>
      </div>
      
      <!-- 日期列 Day columns -->
      <div class="day-columns">
        <div 
          v-for="(day, dayIndex) in weekDays" 
          :key="dayIndex" 
          class="day-column"
          :class="{ 'current-day-column': isCurrentDay(day.date) }"
        >
          <!-- 每小時格子 Hourly cells -->
          <div 
            v-for="hour in hours" 
            :key="`${dayIndex}-${hour}`" 
            class="hour-cell"
            @click="handleCellClick(day.date, hour)"
          >
            <!-- 半小時分隔線 Half-hour divider -->
            <div class="half-hour-divider"></div>
          </div>
          
          <!-- 課程事件 Course events -->
          <div 
            v-for="(event, eventIndex) in getEventsForDay(day.date)" 
            :key="`event-${eventIndex}`" 
            class="event-card"
            :style="getEventStyle(event)"
            @click.stop="handleEventClick(event)"
          >
            <div class="event-title">{{ event.title }}</div>
            <div class="event-time">{{ formatEventTime(event) }}</div>
            <div class="event-location" v-if="event.location">{{ event.location }}</div>
          </div>
        </div>
      </div>
      
      <!-- 當前時間線 Current time line -->
      <div 
        v-if="isCurrentWeek" 
        class="current-time-line"
        :style="currentTimeLineStyle"
      ></div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted, onUnmounted } from 'vue';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isToday, 
  isSameDay, 
  isSameWeek,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  parseISO
} from 'date-fns';
import { zhTW } from 'date-fns/locale';

export default defineComponent({
  name: 'WeekView',
  
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
    // 時間範圍 Time range
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00
    
    // 當前時間線更新計時器 Current time line update timer
    const timeUpdateInterval = ref(null);
    
    // 計算屬性 Computed properties
    
    // 週的日期 Week days
    const weekDays = computed(() => {
      const weekStart = startOfWeek(props.currentDate, { weekStartsOn: 1 }); // 從週一開始 Start from Monday
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      return eachDayOfInterval({ start: weekStart, end: weekEnd }).map(date => ({
        date,
        dayName: format(date, 'EEE', { locale: zhTW }), // 星期幾 Day of week
        dayNumber: format(date, 'd') // 日期 Day number
      }));
    });
    
    // 是否為當前週 Is current week
    const isCurrentWeek = computed(() => {
      return isSameWeek(new Date(), props.currentDate, { weekStartsOn: 1 });
    });
    
    // 當前時間線樣式 Current time line style
    const currentTimeLineStyle = computed(() => {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      
      // 計算從頂部的偏移量 Calculate offset from top
      const startHour = 8; // 開始時間 Start time
      const hourHeight = 60; // 每小時的高度（像素） Height per hour (pixels)
      
      const topOffset = (hours - startHour + minutes / 60) * hourHeight;
      
      // 計算從左側的偏移量 Calculate offset from left
      const dayWidth = 100 / 7; // 每天的寬度百分比 Width percentage per day
      const currentDayIndex = weekDays.value.findIndex(day => isToday(day.date));
      
      const leftOffset = currentDayIndex >= 0 ? dayWidth * currentDayIndex : 0;
      
      return {
        top: `${topOffset}px`,
        left: `${leftOffset}%`,
        width: `${dayWidth}%`
      };
    });
    
    // 方法 Methods
    
    // 格式化小時 Format hour
    const formatHour = (hour) => {
      return `${hour}:00`;
    };
    
    // 是否為當天 Is current day
    const isCurrentDay = (date) => {
      return isToday(date);
    };
    
    // 獲取指定日期的事件 Get events for specific day
    const getEventsForDay = (date) => {
      return props.events.filter(event => {
        if (!event.date) return false;
        const eventDate = parseISO(event.date);
        return isSameDay(eventDate, date);
      });
    };
    
    // 獲取事件樣式 Get event style
    const getEventStyle = (event) => {
      // 解析時間字符串 Parse time strings
      const [startHour, startMinute] = event.startTime.split(':').map(Number);
      const [endHour, endMinute] = event.endTime.split(':').map(Number);
      
      // 計算事件開始時間的位置 Calculate position of event start time
      const startTime = startHour + startMinute / 60;
      const endTime = endHour + endMinute / 60;
      
      // 計算事件持續時間 Calculate event duration
      const duration = endTime - startTime;
      
      // 計算從頂部的偏移量 Calculate offset from top
      const startHourOffset = 8; // 開始時間 Start time
      const hourHeight = 60; // 每小時的高度（像素） Height per hour (pixels)
      
      const top = (startTime - startHourOffset) * hourHeight;
      const height = duration * hourHeight;
      
      return {
        top: `${top}px`,
        height: `${height}px`
      };
    };
    
    // 格式化事件時間 Format event time
    const formatEventTime = (event) => {
      return `${event.startTime} - ${event.endTime}`;
    };
    
    // 處理事件點擊 Handle event click
    const handleEventClick = (event) => {
      emit('event-click', event);
    };
    
    // 處理單元格點擊 Handle cell click
    const handleCellClick = (date, hour) => {
      const clickedDate = setHours(setMinutes(date, 0), hour);
      emit('date-click', clickedDate);
    };
    
    // 更新當前時間線 Update current time line
    const updateCurrentTimeLine = () => {
      // 每分鐘更新一次 Update every minute
      timeUpdateInterval.value = setInterval(() => {
        // 強制重新計算 Force recalculation
        const now = new Date();
      }, 60000); // 60秒 60 seconds
    };
    
    // 生命週期鉤子 Lifecycle hooks
    onMounted(() => {
      updateCurrentTimeLine();
    });
    
    onUnmounted(() => {
      if (timeUpdateInterval.value) {
        clearInterval(timeUpdateInterval.value);
      }
    });
    
    return {
      hours,
      weekDays,
      isCurrentWeek,
      currentTimeLineStyle,
      formatHour,
      isCurrentDay,
      getEventsForDay,
      getEventStyle,
      formatEventTime,
      handleEventClick,
      handleCellClick
    };
  }
});
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.week-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.week-header {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
  z-index: 2;
  
  .time-column-header {
    width: 60px;
    flex-shrink: 0;
  }
  
  .day-column-header {
    flex: 1;
    text-align: center;
    padding: var(--spacing-sm) 0;
    border-left: 1px solid var(--color-gray-200);
    
    &.current-day {
      background-color: rgba(0, 113, 227, 0.05);
      
      .day-number {
        background-color: var(--color-primary);
        color: white;
      }
    }
    
    .day-name {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin-bottom: var(--spacing-xs);
    }
    
    .day-number {
      display: inline-block;
      width: 28px;
      height: 28px;
      line-height: 28px;
      border-radius: 50%;
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-medium);
    }
  }
}

.week-grid {
  display: flex;
  flex: 1;
  position: relative;
  overflow-y: auto;
  
  .time-axis {
    width: 60px;
    flex-shrink: 0;
    border-right: 1px solid var(--color-gray-200);
    background-color: var(--color-white);
    z-index: 1;
    
    .time-slot {
      height: 60px; // 每小時高度 Height per hour
      position: relative;
      
      .time-label {
        position: absolute;
        top: -10px;
        right: var(--spacing-sm);
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
      }
    }
  }
  
  .day-columns {
    display: flex;
    flex: 1;
    position: relative;
    
    .day-column {
      flex: 1;
      position: relative;
      border-left: 1px solid var(--color-gray-200);
      
      &.current-day-column {
        background-color: rgba(0, 113, 227, 0.02);
      }
      
      .hour-cell {
        height: 60px; // 每小時高度 Height per hour
        border-bottom: 1px solid var(--color-gray-200);
        position: relative;
        
        &:hover {
          background-color: rgba(0, 113, 227, 0.05);
        }
        
        .half-hour-divider {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: var(--color-gray-100);
        }
      }
      
      .event-card {
        position: absolute;
        left: var(--spacing-xs);
        right: var(--spacing-xs);
        background-color: rgba(0, 113, 227, 0.1);
        border-left: 3px solid var(--color-primary);
        border-radius: var(--radius-sm);
        padding: var(--spacing-xs);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 1;
        
        &:hover {
          background-color: rgba(0, 113, 227, 0.15);
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        
        .event-title {
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-sm);
          margin-bottom: var(--spacing-xs);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .event-time, .event-location {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
  
  .current-time-line {
    position: absolute;
    height: 2px;
    background-color: var(--color-danger);
    z-index: 2;
    
    &::before {
      content: '';
      position: absolute;
      left: -4px;
      top: -4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--color-danger);
    }
  }
}
</style> 