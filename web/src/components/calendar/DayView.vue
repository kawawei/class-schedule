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
        <!-- 課程事件 Course events -->
        <div class="events-scroll-container">
          <div 
            v-for="event in dayEvents" 
            :key="event.id"
            class="event-container"
            :class="{ 'has-teacher': event.teacherName && event.teacherName !== '待訂' }"
            :style="getEventStyle(event)"
            @click="handleEventClick(event)"
            draggable="true"
            @dragstart="handleDragStart($event, event)"
            @dragend="handleDragEnd"
          >
            <div class="event-content">
              <span class="time">{{ formatTime(event.startTime) }}-{{ formatTime(event.endTime) }}</span>
              <span class="area" v-if="event.district">{{ truncateText(event.district, 2) }}</span>
              <span class="school">{{ truncateText(event.schoolName, 3) }}</span>
              <span class="teacher" :class="{ 'pending': !event.teacherName || event.teacherName === '待訂' }">
                {{ event.courseType }}&nbsp;&nbsp;&nbsp;&nbsp;{{ !event.teacherName || event.teacherName === '待訂' ? '待訂' : event.teacherName }}
              </span>
            </div>
          </div>
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
    
    // 將事件按時間分組 Group events by time
    const groupedEvents = computed(() => {
      const groups = {};
      dayEvents.value.forEach(event => {
        if (!groups[event.startTime]) {
          groups[event.startTime] = {
            startTime: event.startTime,
            endTime: event.endTime,
            events: []
          };
        }
        groups[event.startTime].events.push(event);
      });
      return Object.values(groups);
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
      
      // 計算開始和結束時間的位置（考慮偏移量）Calculate start and end time positions with offset
      const hourHeight = 60; // 每小時的高度（像素）Height per hour (pixels)
      const topOffset = startHour * hourHeight + (startMinute / 60) * hourHeight;
      const duration = (endHour - startHour) * hourHeight + ((endMinute - startMinute) / 60) * hourHeight;
      
      // 獲取同一時間段的事件數量和當前事件的索引
      // Get the number of events in the same time slot and current event index
      const overlappingEvents = dayEvents.value.filter(e => {
        const [eStartHour, eStartMinute] = e.startTime.split(':').map(Number);
        const [eEndHour, eEndMinute] = e.endTime.split(':').map(Number);
        const eventStart = eStartHour + eStartMinute / 60;
        const eventEnd = eEndHour + eEndMinute / 60;
        const thisStart = startHour + startMinute / 60;
        const thisEnd = endHour + endMinute / 60;
        
        return (eventStart < thisEnd && eventEnd > thisStart);
      });
      
      const eventIndex = overlappingEvents.findIndex(e => e.id === event.id);
      const totalEvents = Math.min(overlappingEvents.length, 8); // 最多顯示8個 Maximum 8 events
      
      return {
        top: `${topOffset}px`,
        height: `${duration}px`,
        width: `calc((100% - ${(totalEvents - 1) * 8}px) / ${totalEvents})`,
        left: `${eventIndex * (100 / totalEvents)}%`,
        position: 'absolute',
        zIndex: 1
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
    const handleDragStart = (event, courseData) => {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        courseId: courseData.id,
        uuid: courseData.uuid,
        date: courseData.date
      }));
      emit('dragstart', courseData);
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
    
    // 添加格式化和截斷文字的函數
    const formatTime = (time) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const truncateText = (text, length) => {
      if (!text) return '';
      return text.slice(0, length);
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
      groupedEvents,
      currentTimeLineStyle,
      formatHour,
      getEventStyle,
      handleEventClick,
      handleCellClick,
      handleDragStart,
      handleDragEnd,
      handleDrop,
      handleHourDrop,
      formatTime,
      truncateText
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
      
      .events-scroll-container {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        pointer-events: none;
        
        .event-container {
          pointer-events: auto;
          position: absolute;
          background-color: white;
          border: 1px solid var(--color-gray-200);
          border-left: 3px solid #9e9e9e;
          border-radius: var(--radius-sm);
          padding: var(--spacing-xs);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
            background-color: #f5f5f5;
            z-index: 2;
          }
          
          &.has-teacher {
            background-color: white;
            border-left: 3px solid #5fd3bc;
            
            &:hover {
              background-color: #f5f5f5;
            }
          }

          .event-content {
            height: 100%;
            display: flex;
            flex-direction: column;
            gap: var(--spacing-xs);
            color: var(--text-primary);

            .time {
              font-size: var(--font-size-xs);
              color: var(--text-secondary);
            }

            .area,
            .school {
              font-size: var(--font-size-xs);
              color: var(--text-secondary);
            }

            .teacher {
              font-weight: var(--font-weight-medium);
              font-size: var(--font-size-sm);
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              &.pending {
                color: var(--text-secondary);
              }
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