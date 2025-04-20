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
            :class="{
              'has-teacher': event.teacherName && event.teacherName !== '待訂',
              'event-position-1': eventIndex === 0,
              'event-position-2': eventIndex === 1,
              'event-position-3': eventIndex === 2
            }"
            :style="getEventStyle(event)"
            @click.stop="handleEventClick(event)"
            @mouseenter="handleMouseEnter($event, event)"
            @mouseleave="handleMouseLeave"
          >
            <div class="event-content">
              <div class="event-title">{{ event.className }} - {{ event.teacherName || '待訂' }}</div>
              <div class="event-time">{{ formatEventTime(event) }}</div>
              <div class="event-location" v-if="event.schoolName">{{ event.schoolName }}</div>
            </div>
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
    
    <!-- 懸浮窗口 Hover Tooltip -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="showTooltip && tooltipData" 
          class="tooltip"
          :class="{ 'left-aligned': isLeftAligned }"
          :style="tooltipStyle"
        >
          <div class="tooltip-content">
            <div class="tooltip-header">
              <span class="course-type">{{ tooltipData.courseType }}</span>
              <span class="course-count" v-if="tooltipData.totalClasses > 1">
                (共 {{ tooltipData.totalClasses }} 堂
                <span v-if="tooltipData.dateRange">
                  {{ tooltipData.dateRange }}
                </span>)
              </span>
            </div>
            <div class="tooltip-info">
              <p><strong>時間：</strong>{{ formatTime(tooltipData.startTime) }}-{{ formatTime(tooltipData.endTime) }}</p>
              <p><strong>地點：</strong>{{ tooltipData.county }} {{ tooltipData.district }}</p>
              <p><strong>補習班：</strong>{{ tooltipData.schoolName }}</p>
              <p><strong>老師：</strong>{{ !tooltipData.teacherName || tooltipData.teacherName === '待訂' ? '待訂' : tooltipData.teacherName }}</p>
              <p v-if="tooltipData.assistantName"><strong>助教：</strong>{{ tooltipData.assistantName }}</p>
              <p><strong>班級：</strong>{{ tooltipData.className || '無' }}</p>
              
              <!-- 備註 Notes -->
              <div class="notes-section" v-if="tooltipData.notes">
                <strong>備註：</strong>
                <span class="notes-content">{{ tooltipData.notes }}</span>
              </div>
              
              <!-- 費用信息 Fee Information -->
              <div class="fees-section">
                <h4>課程費用：</h4>
                <p>
                  <span>本堂：</span>{{ formatCurrency(tooltipData.courseFee || 0) }}
                  <span v-if="tooltipData.totalFees?.courseFee">
                    / 總計：{{ formatCurrency(tooltipData.totalFees.courseFee) }}
                  </span>
                </p>
                <p>
                  <span>教師費：</span>{{ formatCurrency(tooltipData.teacherFee || 0) }}
                  <span v-if="tooltipData.totalFees?.teacherFee">
                    / 總計：{{ formatCurrency(tooltipData.totalFees.teacherFee) }}
                  </span>
                </p>
                <p v-if="tooltipData.assistantFee">
                  <span>助教費：</span>{{ formatCurrency(tooltipData.assistantFee) }}
                  <span v-if="tooltipData.totalFees?.assistantFee">
                    / 總計：{{ formatCurrency(tooltipData.totalFees.assistantFee) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted, onUnmounted, inject } from 'vue';
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
import HoverTooltip from '@/components/base/HoverTooltip.vue';
import { scheduleAPI } from '@/utils/api';

export default defineComponent({
  name: 'WeekView',
  
  components: {
    HoverTooltip
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
  
  emits: ['event-click', 'date-click'],
  
  setup(props, { emit }) {
    // 時間範圍 Time range (00:00-23:59)
    const hours = Array.from({ length: 24 }, (_, i) => i); // 00:00 - 23:00
    
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
      const hourHeight = 60; // 每小時的高度（像素） Height per hour (pixels)
      const topOffset = (hours + minutes / 60) * hourHeight;
      
      // 計算從左側的偏移量 Calculate offset from left
      const timeAxisWidth = 60; // 時間軸寬度 Time axis width
      const currentDayIndex = weekDays.value.findIndex(day => isToday(day.date));
      
      // 如果找到當前日期，計算偏移量 If current date is found, calculate offset
      const leftOffset = currentDayIndex >= 0 
        ? `calc(${timeAxisWidth}px + (100% - ${timeAxisWidth}px) * ${currentDayIndex / 7})`
        : `${timeAxisWidth}px`;
      
      // 計算時間線寬度 Calculate time line width
      const width = `calc((100% - ${timeAxisWidth}px) / 7)`;
      
      return {
        top: `${topOffset}px`,
        left: leftOffset,
        width
      };
    });
    
    // 方法 Methods
    
    // 格式化小時 Format hour
    const formatHour = (hour) => {
      return `${hour.toString().padStart(2, '0')}:00`;
    };
    
    // 是否為當天 Is current day
    const isCurrentDay = (date) => {
      return isToday(date);
    };
    
    // 獲取指定日期的事件 Get events for specific day
    const getEventsForDay = (date) => {
      return props.events.filter(event => {
        if (!event.date) return false;
        const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
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
      const hourHeight = 60; // 每小時的高度（像素） Height per hour (pixels)
      
      const top = startTime * hourHeight;
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
      console.log('課程點擊事件數據 Course click event data:', event);
      emit('event-click', {
        id: event.id,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        courseType: event.courseType,
        schoolName: event.schoolName,
        className: event.className,
        teacherName: event.teacherName,
        assistantName: event.assistantName,
        courseFee: event.courseFee,
        teacherFee: event.teacherFee,
        assistantFee: event.assistantFee,
        teacher: event.teacher,
        assistants: event.assistants
      });
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
    
    // 懸浮窗口相關狀態 Tooltip related states
    const showTooltip = ref(false);
    const tooltipData = ref(null);
    const tooltipStyle = ref({
      position: 'fixed',
      left: '0px',
      top: '0px',
      zIndex: 999999999
    });
    
    const isLeftAligned = ref(false);
    
    // 格式化時間 Format time
    const formatTime = (time) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };
    
    // 格式化貨幣 Format currency
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };
    
    // 注入課程數據服務 Inject course data service
    const courseDataService = inject('courseDataService');
    
    // 處理滑鼠懸浮 Handle mouse enter
    const handleMouseEnter = async (event, courseData) => {
      const rect = event.target.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const tooltipWidth = 400; // 預設寬度 Default width
      
      // 計算最佳位置 Calculate best position
      let left = rect.right + 8;
      // 如果右側空間不足，則顯示在左側 If not enough space on right, show on left
      if (left + tooltipWidth > windowWidth) {
        left = rect.left - tooltipWidth - 8;
        isLeftAligned.value = true;
      } else {
        isLeftAligned.value = false;
      }
      
      tooltipStyle.value = {
        position: 'fixed',
        left: `${left}px`,
        top: `${rect.top}px`,
        zIndex: 999999999
      };
      
      try {
        if (courseData.id) {
          const response = await scheduleAPI.getSchedule(courseData.id);
          if (response.success) {
            const data = response.data;
            
            // 獲取課程系列信息 Get course series info
            let seriesInfo = null;
            if (courseData.uuid && courseDataService) {
              seriesInfo = courseDataService.getCourseSeriesInfoByUuid(courseData.uuid);
              // 格式化日期範圍 Format date range
              if (seriesInfo?.firstDate && seriesInfo?.lastDate) {
                const firstDate = format(new Date(seriesInfo.firstDate), 'yyyy/MM/dd', { locale: zhTW });
                const lastDate = format(new Date(seriesInfo.lastDate), 'yyyy/MM/dd', { locale: zhTW });
                seriesInfo.dateRange = `${firstDate} ~ ${lastDate}`;
              }
            }
            
            tooltipData.value = {
              courseType: data.course_type || courseData.courseType,
              startTime: data.start_time || courseData.startTime,
              endTime: data.end_time || courseData.endTime,
              county: data.county || courseData.county,
              district: data.district || courseData.district,
              schoolName: data.school_name || courseData.schoolName,
              teacherName: data.teacher?.name || courseData.teacherName,
              assistantName: data.assistants?.[0]?.name || courseData.assistantName,
              className: data.class_name || courseData.className,
              notes: data.notes || courseData.notes,
              courseFee: data.course_fee || courseData.courseFee,
              teacherFee: data.teacher_fee || courseData.teacherFee,
              assistantFee: data.assistants?.[0]?.fee || courseData.assistantFee,
              totalClasses: seriesInfo?.count || 1,
              dateRange: seriesInfo?.dateRange || null,
              totalFees: seriesInfo?.totalFees || null,
              uuid: courseData.uuid
            };
          }
        } else {
          // 獲取課程系列信息 Get course series info
          let seriesInfo = null;
          if (courseData.uuid && courseDataService) {
            seriesInfo = courseDataService.getCourseSeriesInfoByUuid(courseData.uuid);
          }
          
          tooltipData.value = {
            courseType: courseData.courseType,
            startTime: courseData.startTime,
            endTime: courseData.endTime,
            county: courseData.county,
            district: courseData.district,
            schoolName: courseData.schoolName,
            teacherName: courseData.teacherName,
            assistantName: courseData.assistantName,
            className: courseData.className,
            notes: courseData.notes,
            courseFee: courseData.courseFee,
            teacherFee: courseData.teacherFee,
            assistantFee: courseData.assistantFee,
            totalClasses: seriesInfo?.count || 1,
            dateRange: seriesInfo?.dateRange || null,
            totalFees: seriesInfo?.totalFees || null,
            uuid: courseData.uuid
          };
        }
        showTooltip.value = true;
      } catch (error) {
        console.error('獲取課程詳情失敗:', error);
      }
    };
    
    // 處理滑鼠離開 Handle mouse leave
    const handleMouseLeave = () => {
      showTooltip.value = false;
      tooltipData.value = null;
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
      handleCellClick,
      showTooltip,
      tooltipData,
      tooltipStyle,
      formatTime,
      formatCurrency,
      isLeftAligned,
      handleMouseEnter,
      handleMouseLeave,
      courseDataService
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
  
  .week-header {
    display: flex;
    border-bottom: 1px solid var(--color-gray-200);
    background-color: var(--color-white);
    z-index: 2;
    height: 64px; // 固定標題行高度
    
    .time-column-header {
      width: 60px;
      flex-shrink: 0;
      padding-top: var(--spacing-md); // 增加頂部內邊距
    }
    
    .day-column-header {
      flex: 1;
      padding: var(--spacing-md) var(--spacing-sm) var(--spacing-sm); // 調整內邊距
      text-align: center;
      border-left: 1px solid var(--color-gray-200);
      
      &.current-day {
        background-color: rgba(0, 113, 227, 0.02);
        font-weight: var(--font-weight-bold);
      }
      
      .day-name {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
      }
      
      .day-number {
        font-size: var(--font-size-lg);
        color: var(--text-primary);
        margin-top: var(--spacing-xs); // 增加日期數字的上邊距
      }
    }
  }
}

.week-grid {
  display: flex;
  flex: 1;
  position: relative;
  overflow-y: auto;
  padding-bottom: var(--spacing-md);
  padding-top: 36px; // 增加頂部內邊距
  
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
      
      &:first-child {
        margin-top: -24px; // 調整第一個時間格的位置
        
        .time-label {
          top: 4px; // 特別調整第一個時間標籤的位置
        }
      }
      
      .time-label {
        position: absolute;
        top: -9px;
        right: var(--spacing-sm);
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
        background-color: var(--color-white);
        padding: 2px 4px; // 增加垂直內邊距
        line-height: 14px; // 調整行高
        z-index: 2;
      }
    }
  }
  
  .day-columns {
    display: flex;
    flex: 1;
    position: relative;
    min-width: 0;
    margin-top: -24px; // 調整日期列的位置
    
    .day-column {
      flex: 1;
      position: relative;
      border-left: 1px solid var(--color-gray-200);
      min-width: 0;
      
      &.current-day-column {
        background-color: rgba(0, 113, 227, 0.02);
      }
      
      .hour-cell {
        height: 60px;
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
        position: absolute !important;
        background-color: #e0e0e0 !important; // 沒有老師時的背景色
        border: none !important;
        border-radius: var(--radius-sm);
        padding: var(--spacing-xs);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 1;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        width: calc(33.33% - var(--spacing-sm));
        
        &.event-position-1 {
          left: var(--spacing-xs);
        }
        
        &.event-position-2 {
          left: calc(33.33% + var(--spacing-xs));
        }
        
        &.event-position-3 {
          left: calc(66.66% + var(--spacing-xs));
        }
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
          z-index: 2;
          background-color: #d8d8d8 !important; // 沒有老師時的 hover 背景色
        }
        
        &.has-teacher {
          background-color: #5fd3bc !important; // 有老師時的背景色
          
          &:hover {
            background-color: #4fc3ac !important; // 有老師時的 hover 背景色
          }
        }
        
        .event-content {
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .event-title {
          font-weight: var(--font-weight-medium);
          font-size: var(--font-size-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text-primary);
          line-height: 1.2;
        }
        
        .event-time, .event-location {
          font-size: var(--font-size-xs);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
      }
    }
  }
  
  .current-time-line {
    position: absolute;
    left: 60px; // 時間軸寬度
    right: 0;
    height: 2px;
    background-color: var(--color-danger);
    z-index: 3;
    pointer-events: none;
  }
}

.hidden-block {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  
  :deep(.schedule-block) {
    display: none !important;
    visibility: hidden !important;
  }
}

.tooltip {
  position: fixed;
  z-index: 999999999;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: none;
  max-width: 400px;
  min-width: 280px;
  white-space: normal;
  word-wrap: break-word;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  line-height: 1.5;
  isolation: isolate;
  
  // 確保不會超出視窗範圍 Ensure tooltip stays within viewport
  &.left-aligned {
    right: calc(100% + 8px);
    left: auto;
  }
  
  .tooltip-content {
    .tooltip-header {
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      .course-type {
        font-size: 16px;
        font-weight: 600;
      }

      .course-count {
        font-size: 14px;
        opacity: 0.8;
        margin-left: 8px;
      }
    }

    .tooltip-info {
      p {
        margin: 8px 0;
        line-height: 1.6;
        display: flex;
        align-items: flex-start;

        strong {
          flex: 0 0 80px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }

    .notes-section {
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      
      .notes-content {
        display: block;
        margin-top: 4px;
        white-space: pre-wrap;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(255, 255, 255, 0.1);
        padding: 8px;
        border-radius: 4px;
      }
    }

    .fees-section {
      margin-top: 12px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;

      h4 {
        margin: 0 0 8px;
        color: rgba(255, 255, 255, 0.9);
      }

      p {
        margin: 6px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;

        span:first-child {
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }
}

// 動畫效果 Animation effects
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style> 