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
        >
          <ScheduleBlock
            :start-time="formatEventTime(event).split(' - ')[0]"
            :end-time="formatEventTime(event).split(' - ')[1]"
            :course-type="event.courseType"
            :school-name="event.schoolName"
            :teacher-name="event.teacherName"
            :assistant-name="event.assistantName"
            :position="event.position"
            :course-id="event.id"
            :uuid="event.uuid"
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
    // 時間範圍 Time range
    const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 - 21:00
    
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
      });
    });
    
    // 當前時間線樣式 Current time line style
    const currentTimeLineStyle = computed(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const top = ((hours - 8) * 60 + minutes) * (60 / 30); // 每30分鐘一個格子
      return {
        top: `${top}px`
      };
    });
    
    // 格式化小時 Format hour
    const formatHour = (hour) => {
      return `${hour.toString().padStart(2, '0')}:00`;
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
    };
    
    // 處理拖曳結束 Handle drag end
    const handleDragEnd = () => {
      dragState.value.isDragging = false;
      dragState.value.sourceBlock = null;
      dragState.value.sourceDate = null;
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
      formatEventTime,
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
  background-color: var(--bg-primary);
  position: relative;
  min-width: 200px;

  &:last-child {
    border-right: none;
  }

  .day-header {
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--color-gray-200);
    background-color: var(--bg-secondary);
    z-index: 1;

    .time-column-header {
      height: 24px;
      border-bottom: 1px solid var(--color-gray-200);
    }

    .day-column-header {
      height: 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px;
      position: relative;

      &.current-day {
        background-color: var(--color-primary-light);
        color: var(--color-primary);
      }

      .day-name {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: var(--text-secondary);
        margin-bottom: 2px;
      }

      .day-number {
        font-size: var(--font-size-lg);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
      }
    }
  }

  .day-grid {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;

    .time-axis {
      width: 48px;
      border-right: 1px solid var(--color-gray-200);
      background-color: var(--bg-secondary);
      z-index: 1;

      .time-slot {
        height: 60px;
        display: flex;
        align-items: flex-start;
        justify-content: flex-end;
        padding-right: 8px;
        border-bottom: 1px solid var(--color-gray-200);

        .time-label {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          transform: translateY(-50%);
        }
      }
    }

    .day-column {
      flex: 1;
      position: relative;
      background-color: var(--bg-primary);

      &.current-day-column {
        background-color: var(--bg-secondary);
      }

      .hour-cell {
        height: 60px;
        border-bottom: 1px solid var(--color-gray-200);
        position: relative;
        cursor: pointer;

        &:hover {
          background-color: var(--bg-tertiary);
        }

        // 添加拖曳時的視覺反饋 Add visual feedback during drag
        &.dragover {
          outline: 2px dashed var(--color-primary);
          outline-offset: -2px;
          background-color: rgba(24, 144, 255, 0.05);
          z-index: 2;
        }

        .half-hour-divider {
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 1px;
          background-color: var(--color-gray-200);
          opacity: 0.5;
        }
      }

      .event-container {
        position: absolute;
        left: 4px;
        right: 4px;
        z-index: 2;
      }
    }

    .current-time-line {
      position: absolute;
      left: 48px;
      right: 0;
      height: 2px;
      background-color: var(--color-danger);
      z-index: 3;
      pointer-events: none;
    }
  }
}
</style> 