<template>
  <div class="day-view">
    <!-- 日期標題 Day header -->
    <div class="day-header">
      <div class="time-column-header"></div>
      <div 
        class="day-column-header"
        :class="{ 'current-day': isCurrentDay }"
      >
        <div class="day-name">{{ dayName }}</div>
        <div class="day-number">{{ dayNumber }}</div>
      </div>
    </div>
    
    <!-- 時間網格 Time grid -->
    <div class="day-grid">
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
      
      <!-- 日期列 Day column -->
      <div 
        class="day-column" 
        :class="{ 'current-day-column': isCurrentDay }"
        @dragover.prevent
        @drop="handleDrop"
      >
        <!-- 每小時格子 Hourly cells -->
        <div 
          v-for="hour in hours" 
          :key="hour" 
          class="hour-cell"
          @click="handleCellClick(hour)"
          @dragover.prevent
          @drop="handleHourDrop($event, hour)"
        >
          <!-- 半小時分隔線 Half-hour divider -->
          <div class="half-hour-divider"></div>
        </div>
        
        <!-- 課程事件 Course events -->
        <div 
          v-for="(event, eventIndex) in dayEvents" 
          :key="`event-${eventIndex}`" 
          class="event-container"
          :style="getEventStyle(event)"
        >
          <ScheduleBlock
            :key="`${event.id}-${currentDate.getTime()}`"
            :start-time="event.startTime"
            :end-time="event.endTime"
            :course-type="event.courseType"
            :school-name="event.schoolName"
            :teacher-name="event.teacherName"
            :assistant-name="event.assistantName"
            :position="event.position"
            :course-id="event.id"
            :uuid="event.uuid"
            :date="event.date"
            :title="event.title"
            :location="event.location"
            @click="handleEventClick(event)"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
          />
        </div>
      </div>
      
      <!-- 當前時間線 Current time line -->
      <div 
        v-if="isCurrentDay" 
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
  isToday, 
  isSameDay,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  parseISO
} from 'date-fns';
import { zhTW } from 'date-fns/locale';
import ScheduleBlock from '@/components/schedule/ScheduleBlock.vue';

export default defineComponent({
  name: 'DayView',
  
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
    // 時間範圍 Time range (00:00-23:59)
    const hours = Array.from({ length: 24 }, (_, i) => i); // 00:00 - 23:00
    
    // 當前時間線更新計時器 Current time line update timer
    const timeUpdateInterval = ref(null);
    
    // 拖曳狀態 Drag state
    const dragState = ref({
      isDragging: false,
      sourceBlock: null,
      sourceDate: null
    });
    
    // 計算屬性 Computed properties
    
    // 日期格式化 Day formatting
    const dayName = computed(() => {
      return format(props.currentDate, 'EEEE', { locale: zhTW }); // 星期幾 Day of week
    });
    
    const dayNumber = computed(() => {
      return format(props.currentDate, 'd'); // 日期 Day number
    });
    
    // 是否為當天 Is current day
    const isCurrentDay = computed(() => {
      return isToday(props.currentDate);
    });
    
    // 當前日期的事件 Events for current day
    const dayEvents = computed(() => {
      return props.events.filter(event => {
        if (!event.date) return false;
        const eventDate = parseISO(event.date);
        return isSameDay(eventDate, props.currentDate);
      }).map(event => ({
        ...event,
        title: `${event.className} - ${event.teacherName}`,
        location: event.schoolName,
        date: format(props.currentDate, 'yyyy-MM-dd') // 確保使用當前選中的日期
      }));
    });
    
    // 當前時間線樣式 Current time line style
    const currentTimeLineStyle = computed(() => {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      
      // 計算從頂部的偏移量 Calculate offset from top
      const hourHeight = 60; // 每小時的高度（像素） Height per hour (pixels)
      const topOffset = (hours + minutes / 60) * hourHeight;
      
      return {
        top: `${topOffset}px`
      };
    });
    
    // 格式化小時 Format hour
    const formatHour = (hour) => {
      return `${hour.toString().padStart(2, '0')}:00`;
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
      const hourHeight = 60; // 每小時的高度（像素） Height per hour (pixels)
      const headerHeight = 64; // 頭部高度 Header height
      const gridPaddingTop = 24; // 網格頂部內邊距 Grid top padding
      const firstHourOffset = -12; // 第一個小時的偏移量 First hour offset
      
      // 計算精確的頂部位置 Calculate precise top position
      const top = (startTime * hourHeight) + firstHourOffset;
      
      // 計算精確的高度 Calculate precise height
      const height = Math.max(duration * hourHeight, 30); // 最小高度30px Minimum height 30px
      
      return {
        top: `${top}px`,
        height: `${height}px`,
        left: 'var(--spacing-xs)',
        right: 'var(--spacing-xs)',
        position: 'absolute',
        zIndex: 2
      };
    };
    
    // 處理事件點擊 Handle event click
    const handleEventClick = (event) => {
      emit('event-click', event);
    };
    
    // 處理單元格點擊 Handle cell click
    const handleCellClick = (hour) => {
      emit('date-click', {
        date: props.currentDate,
        hour
      });
    };
    
    // 處理拖曳開始 Handle drag start
    const handleDragStart = (event) => {
      dragState.value.isDragging = true;
      dragState.value.sourceBlock = event;
      dragState.value.sourceDate = props.currentDate;
      emit('dragstart', event);
    };
    
    // 處理拖曳結束 Handle drag end
    const handleDragEnd = () => {
      dragState.value.isDragging = false;
      dragState.value.sourceBlock = null;
      dragState.value.sourceDate = null;
      emit('dragend');
    };
    
    // 處理拖放 Handle drop
    const handleDrop = (event) => {
      event.preventDefault();
      
      try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const targetDate = format(props.currentDate, 'yyyy-MM-dd');
        
        // 如果目標日期與源日期相同，不處理
        if (targetDate === data.date) return;
        
        // 觸發課程移動事件 Emit course move event
        emit('course-move', {
          courseId: data.courseId,
          uuid: data.uuid,
          sourceDate: data.date,
          targetDate,
          isCopy: event.ctrlKey || event.metaKey
        });
      } catch (error) {
        console.error('處理拖放失敗 Handle drop failed:', error);
      }
    };
    
    // 處理小時格子的拖放 Handle hour cell drop
    const handleHourDrop = (event, hour) => {
      event.preventDefault();
      
      try {
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        const targetDate = format(props.currentDate, 'yyyy-MM-dd');
        
        // 如果目標日期與源日期相同，不處理
        if (targetDate === data.date) return;
        
        // 觸發課程移動事件 Emit course move event
        emit('course-move', {
          courseId: data.courseId,
          uuid: data.uuid,
          sourceDate: data.date,
          targetDate,
          targetHour: hour,
          isCopy: event.ctrlKey || event.metaKey
        });
      } catch (error) {
        console.error('處理小時格子拖放失敗 Handle hour cell drop failed:', error);
      }
    };
    
    // 組件掛載時啟動時間線更新 Start time line update when component is mounted
    onMounted(() => {
      timeUpdateInterval.value = setInterval(() => {
        // 強制更新當前時間線樣式 Force update current time line style
        currentTimeLineStyle.value;
      }, 60000); // 每分鐘更新一次 Update every minute
    });
    
    // 組件卸載時清理計時器 Clean up timer when component is unmounted
    onUnmounted(() => {
      if (timeUpdateInterval.value) {
        clearInterval(timeUpdateInterval.value);
      }
    });
    
    return {
      hours,
      dayName,
      dayNumber,
      isCurrentDay,
      dayEvents,
      currentTimeLineStyle,
      formatHour,
      getEventStyle,
      handleEventClick,
      handleCellClick,
      handleDragStart,
      handleDragEnd,
      handleDrop,
      handleHourDrop
    };
  }
});
</script>

<style lang="scss" scoped>
.day-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid var(--color-gray-200);
  background-color: var(--color-white);
  position: relative;
  min-width: 200px;
  overflow: hidden;

  .day-header {
    display: flex;
    border-bottom: 1px solid var(--color-gray-200);
    background-color: var(--color-white);
    z-index: 2;
    height: 64px;
    
    .time-column-header {
      width: 60px;
      flex-shrink: 0;
      padding-top: var(--spacing-xs);
      background-color: var(--color-white);
    }
    
    .day-column-header {
      flex: 1;
      padding: var(--spacing-sm) var(--spacing-sm);
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: var(--color-white);
      
      &.current-day {
        background-color: rgba(0, 113, 227, 0.02);
        font-weight: var(--font-weight-bold);
      }
      
      .day-name {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin-bottom: 4px;
      }
      
      .day-number {
        font-size: var(--font-size-lg);
        color: var(--text-primary);
      }
    }
  }

  .day-grid {
    flex: 1;
    display: flex;
    position: relative;
    overflow-y: auto;
    padding-bottom: var(--spacing-md);
    padding-top: 24px;
    background-color: var(--color-white);
    
    .time-axis {
      width: 60px;
      flex-shrink: 0;
      border-right: 1px solid var(--color-gray-200);
      background-color: var(--color-white);
      z-index: 1;
      position: sticky;
      left: 0;
      
      .time-slot {
        height: 60px;
        position: relative;
        border-bottom: 1px solid var(--color-gray-200);
        background-color: var(--color-white);
        
        &:first-child {
          margin-top: -12px;
          height: 72px;
          
          .time-label {
            top: 16px;
            background-color: var(--color-white);
          }
        }
        
        .time-label {
          position: absolute;
          top: -9px;
          right: var(--spacing-sm);
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          background-color: var(--color-white);
          padding: 2px 4px;
          line-height: 14px;
          z-index: 2;
        }

        &::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background-color: var(--color-gray-200);
          opacity: 0.5;
        }
      }
    }

    .day-column {
      flex: 1;
      position: relative;
      min-width: 0;
      margin-top: -12px;
      background-color: var(--color-white);
      
      &.current-day-column {
        background-color: rgba(0, 113, 227, 0.02);
      }
      
      .hour-cell {
        height: 60px;
        border-bottom: 1px solid var(--color-gray-200);
        position: relative;
        cursor: pointer;
        background-color: var(--color-white);
        transition: all 0.2s ease;
        
        &:first-child {
          height: 72px;
        }
        
        &:hover {
          background-color: rgba(0, 113, 227, 0.08);
          box-shadow: inset 0 0 0 1.5px var(--color-primary);
          z-index: 1;
        }
        
        .half-hour-divider {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background-color: var(--color-gray-200);
          opacity: 0.5;
          pointer-events: none;
        }
      }
      
      .event-container {
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

        :deep(.schedule-block) {
          height: 100%;
          background: none;
          border: none;
          box-shadow: none;
          padding: 0;
          
          .schedule-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            
            .schedule-title {
              font-weight: var(--font-weight-medium);
              font-size: var(--font-size-sm);
              margin-bottom: var(--spacing-xs);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .schedule-time, .schedule-location {
              font-size: var(--font-size-xs);
              color: var(--text-secondary);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
    
    .current-time-line {
      position: absolute;
      left: 60px;
      right: 0;
      height: 2px;
      background-color: var(--color-danger);
      z-index: 3;
      pointer-events: none;
    }
  }
}
</style> 