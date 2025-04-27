<!-- 課程方塊組件 Schedule Block Component -->
<template>
  <div class="schedule-block-wrapper">
    <HoverTooltip :offset="{ x: 10, y: -10 }" v-model="isHovering">
      <template #default>
        <div class="schedule-block-container">
          <button 
            type="button"
            class="schedule-block"
            :class="[
              { 
                'pending-teacher': !teacherName || teacherName === '待訂',
                'has-teacher': teacherName && teacherName !== '待訂'
              }
            ]"
            :style="blockStyle"
            :data-date="date"
            :data-start-time="startTime"
            draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @click="handleBlockClick"
          >
            <div class="block-content" ref="blockContent">
              <div class="scroll-container" ref="scrollContainer">
                <!-- 時間 Time -->
                <span class="time">{{ formatTime(startTime) }}-{{ formatTime(endTime) }}</span>
                <!-- 區域（前兩字） Area (first 2 chars) -->
                <span class="area" v-if="district">{{ truncateText(district, 2) }}</span>
                <!-- 補習班（前三字） School (first 3 chars) -->
                <span class="school">{{ truncateText(schoolName, 3) }}</span>
                <!-- 課程種類和老師名稱 Course type and teacher name -->
                <span class="teacher" :class="{ 'pending': !teacherName || teacherName === '待訂' }">
                  {{ courseType }}&nbsp;&nbsp;&nbsp;&nbsp;{{ !teacherName || teacherName === '待訂' ? '待訂' : teacherName }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </template>

      <!-- 懸浮窗口內容 Tooltip Content -->
      <template #content>
        <div class="tooltip-content" v-if="tooltipData">
          <div class="tooltip-header">
            <span class="course-type">{{ tooltipData.courseType }}</span>
            <!-- 顯示系列堂數與日期範圍 Show series count and date range -->
            <span class="course-count" v-if="seriesInfo?.count > 1">
              (共 {{ seriesInfo.count }} 堂
              <span v-if="seriesInfo.firstDate && seriesInfo.lastDate">
                {{ seriesInfo.firstDate }} - {{ seriesInfo.lastDate }}
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
            <div class="notes-section">
              <strong>備註：</strong>
              <span class="notes-content">{{ tooltipData.notes || '無' }}</span>
            </div>
            
            <!-- 費用信息 Fee Information -->
            <div class="fees-section">
              <h4>課程費用：</h4>
              <!-- 老師端只顯示教師費 Teacher view only shows teacher fee -->
              <template v-if="isTeacher">
                <p>
                  <span>教師費：</span>{{ formatCurrency(tooltipData.teacherFee || 0) }}
                  <span v-if="seriesInfo?.totalFees?.teacherFee">
                    / 總計：{{ formatCurrency(seriesInfo.totalFees.teacherFee) }}
                  </span>
                </p>
              </template>
              <!-- 管理員端顯示全部費用 Admin view shows all fees -->
              <template v-else>
                <p>
                  <span>本堂：</span>{{ formatCurrency(tooltipData.courseFee || 0) }}
                  <span v-if="seriesInfo?.totalFees?.courseFee">
                    / 總計：{{ formatCurrency(seriesInfo.totalFees.courseFee) }}
                  </span>
                </p>
                <p>
                  <span>教師費：</span>{{ formatCurrency(tooltipData.teacherFee || 0) }}
                  <span v-if="seriesInfo?.totalFees?.teacherFee">
                    / 總計：{{ formatCurrency(seriesInfo.totalFees.teacherFee) }}
                  </span>
                </p>
                <p v-if="tooltipData.assistantFee">
                  <span>助教費：</span>{{ formatCurrency(tooltipData.assistantFee) }}
                  <span v-if="seriesInfo?.totalFees?.assistantFee">
                    / 總計：{{ formatCurrency(seriesInfo.totalFees.assistantFee) }}
                  </span>
                </p>
              </template>
            </div>
          </div>
        </div>
        <div v-else-if="isHovering" class="tooltip-loading">
          加載中...
        </div>
      </template>
    </HoverTooltip>
  </div>
</template>

<script>
import { defineComponent, computed, ref, onMounted, inject, watch } from 'vue';
import HoverTooltip from '../base/HoverTooltip.vue';
import { scheduleAPI } from '@/utils/api';
import './ScheduleBlock.scss';
import { format } from 'date-fns';

export default defineComponent({
  name: 'ScheduleBlock',

  components: {
    HoverTooltip
  },

  props: {
    // 開始時間 Start time (HH:mm format)
    startTime: {
      type: String,
      required: true
    },
    // 結束時間 End time (HH:mm format)
    endTime: {
      type: String,
      required: true
    },
    // 課程類型 Course type
    courseType: {
      type: String,
      required: true,
      validator: (value) => {
        // 只驗證是否為非空字符串 Only validate if it's a non-empty string
        return typeof value === 'string' && value.trim().length > 0;
      }
    },
    // 補習班名稱 School name
    schoolName: {
      type: String,
      required: true
    },
    // 老師名稱 Teacher name
    teacherName: {
      type: String,
      required: true
    },
    // 助教名稱 Assistant name (optional)
    assistantName: {
      type: String,
      default: ''
    },
    // 位置信息 Position info for grid layout
    position: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.hasOwnProperty('row') && value.hasOwnProperty('column');
      }
    },
    // 課程費用 Course fee
    courseFee: {
      type: [String, Number],
      default: ''
    },
    // 教師費用 Teacher fee
    teacherFee: {
      type: [String, Number],
      default: ''
    },
    // 助教費用 Assistant fee
    assistantFee: {
      type: [String, Number],
      default: ''
    },
    // 班級名稱 Class name
    className: {
      type: [String, null],
      default: null
    },
    // 日期 Date
    date: {
      type: String,
      default: ''
    },
    // 課程 ID Course ID
    courseId: {
      type: [String, Number],
      required: true
    },
    // 課程 UUID Course UUID
    uuid: {
      type: String,
      required: false,
      default: () => Math.random().toString(36).substring(2, 15)
    },
    // 標題 Title
    title: {
      type: String,
      default: ''
    },
    // 縣市 County
    county: {
      type: String,
      default: ''
    },
    // 區域 District
    district: {
      type: String,
      default: ''
    },
    // 課程鐘點費 Course hourly rate
    hourlyRate: {
      type: [String, Number],
      default: ''
    },
    // 備註 Notes
    notes: {
      type: String,
      default: ''
    },
    // 是否為老師端（只顯示教師費）Is teacher view (show only teacher fee)
    isTeacher: {
      type: Boolean,
      default: false
    }
  },

  emits: ['click', 'dragstart', 'dragend'],

  setup(props, { emit }) {
    const blockContent = ref(null);
    const scrollContainer = ref(null);
    const tooltipData = ref(null);
    const isLoading = ref(false);
    const isHovering = ref(false);

    // 課程類型標籤 Course type label
    const courseTypeLabel = computed(() => {
      return props.courseType;
    });

    // 方塊樣式 Block style
    const blockStyle = computed(() => ({
      gridRow: `${props.position.row} / span ${calculateRowSpan()}`,
      gridColumn: `${props.position.column}`
    }));

    // 格式化時間 Format time
    const formatTime = (time) => {
      if (!time) return '';
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    // 計算行數跨度 Calculate row span based on time difference
    const calculateRowSpan = () => {
      const start = timeToMinutes(props.startTime);
      const end = timeToMinutes(props.endTime);
      return Math.ceil((end - start) / 30); // 每30分鐘一個格子
    };

    // 將時間轉換為分鐘數 Convert time to minutes
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    // 點擊方塊 Click handler
    const handleBlockClick = () => {
      // 觸發點擊事件並傳遞課程數據 Emit click event with course data
      emit('click', {
        id: props.courseId,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        courseType: props.courseType,
        schoolName: props.schoolName,
        className: props.className,
        teacherName: props.teacherName,
        assistantName: props.assistantName,
        courseFee: props.courseFee,
        teacherFee: props.teacherFee,
        assistantFee: props.assistantFee,
        uuid: props.uuid,
        county: props.county,
        district: props.district
      });
    };

    // 拖曳開始 Drag start handler
    const handleDragStart = (event) => {
      // 設置拖曳數據 Set drag data
      event.dataTransfer.setData('text/plain', JSON.stringify({
        courseId: props.courseId,
        uuid: props.uuid,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        courseType: props.courseType,
        schoolName: props.schoolName,
        className: props.className,
        teacherName: props.teacherName,
        assistantName: props.assistantName,
        courseFee: props.courseFee,
        teacherFee: props.teacherFee,
        assistantFee: props.assistantFee,
        county: props.county,
        district: props.district
      }));
      
      // 設置拖曳效果 Set drag effect
      event.dataTransfer.effectAllowed = 'move';
      
      // 觸發拖曳開始事件 Emit drag start event
      emit('dragstart', {
        courseId: props.courseId,
        uuid: props.uuid,
        date: props.date
      });
    };

    // 拖曳結束 Drag end handler
    const handleDragEnd = (event) => {
      // 觸發拖曳結束事件 Emit drag end event
      emit('dragend', {
        courseId: props.courseId,
        uuid: props.uuid,
        date: props.date
      });
    };

    // 截斷文字函數 Truncate text function
    const truncateText = (text, length) => {
      if (!text) return '';
      return text.slice(0, length);
    };

    // 添加滾動功能 Add scrolling functionality
    onMounted(() => {
      if (scrollContainer.value) {
        let isScrolling = false;
        let startX = 0;
        let scrollLeft = 0;

        scrollContainer.value.addEventListener('mousedown', (e) => {
          isScrolling = true;
          startX = e.pageX - scrollContainer.value.offsetLeft;
          scrollLeft = scrollContainer.value.scrollLeft;
        });

        scrollContainer.value.addEventListener('mouseleave', () => {
          isScrolling = false;
        });

        scrollContainer.value.addEventListener('mouseup', () => {
          isScrolling = false;
        });

        scrollContainer.value.addEventListener('mousemove', (e) => {
          if (!isScrolling) return;
          e.preventDefault();
          const x = e.pageX - scrollContainer.value.offsetLeft;
          const walk = (x - startX) * 2;
          scrollContainer.value.scrollLeft = scrollLeft - walk;
        });

        // 保留滾輪滾動
        scrollContainer.value.addEventListener('wheel', (e) => {
          if (e.deltaY !== 0) {
            e.preventDefault();
            scrollContainer.value.scrollLeft += e.deltaY;
          }
        }, { passive: false });
      }
    });

    // 注入課程數據服務 Inject course data service
    const courseDataService = inject('courseDataService');

    // 獲取課程系列信息 Get course series info
    const seriesInfo = computed(() => {
      if (!props.uuid || !courseDataService) return null;
      const info = courseDataService.getCourseSeriesInfoByUuid(props.uuid);
      if (!info) return null;
      // 格式化日期 Format date
      let firstDate = info.firstDate;
      let lastDate = info.lastDate;
      if (firstDate) firstDate = format(new Date(firstDate), 'yyyy/MM/dd');
      if (lastDate) lastDate = format(new Date(lastDate), 'yyyy/MM/dd');
      return {
        ...info,
        firstDate,
        lastDate
      };
    });

    // 格式化貨幣 Format currency
    const formatCurrency = (value) => {
      if (!value) return '0';
      return new Intl.NumberFormat('zh-TW', {
        style: 'currency',
        currency: 'TWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };

    // 獲取課程詳情 Get course details
    const fetchCourseDetails = async () => {
      if (!props.courseId) return;
      
      try {
        isLoading.value = true;
        const response = await scheduleAPI.getSchedule(props.courseId);
        
        if (response.success) {
          const courseData = response.data;
          tooltipData.value = {
            id: courseData.id,
            courseType: courseData.course_type || props.courseType,
            schoolName: courseData.school_name || props.schoolName,
            className: courseData.class_name || props.className,
            teacherName: courseData.teacher?.name || props.teacherName,
            assistantName: courseData.assistants?.[0]?.assistant_id || props.assistantName,
            startTime: courseData.start_time || props.startTime,
            endTime: courseData.end_time || props.endTime,
            date: courseData.date || props.date,
            courseFee: courseData.course_fee || props.courseFee,
            teacherFee: courseData.teacher_fee || props.teacherFee,
            assistantFee: courseData.assistants?.[0]?.fee || props.assistantFee,
            county: courseData.county || props.county,
            district: courseData.district || props.district,
            notes: courseData.notes || props.notes,
            hourlyRate: courseData.hourly_rate || props.hourlyRate,
            teacher: courseData.teacher,
            assistants: courseData.assistants || [],
            series_id: courseData.series_id
          };
        } else {
          // 如果 API 請求失敗，使用 props 中的數據
          // If API request fails, use data from props
          tooltipData.value = {
            id: props.courseId,
            courseType: props.courseType,
            schoolName: props.schoolName,
            className: props.className,
            teacherName: props.teacherName,
            assistantName: props.assistantName,
            startTime: props.startTime,
            endTime: props.endTime,
            date: props.date,
            courseFee: props.courseFee,
            teacherFee: props.teacherFee,
            assistantFee: props.assistantFee,
            county: props.county,
            district: props.district,
            notes: props.notes,
            hourlyRate: props.hourlyRate,
            teacher: null,
            assistants: [],
            series_id: null
          };
        }
      } catch (error) {
        console.error('獲取課程詳情失敗:', error);
        // 發生錯誤時也使用 props 中的數據
        // Use data from props when error occurs
        tooltipData.value = {
          id: props.courseId,
          courseType: props.courseType,
          schoolName: props.schoolName,
          className: props.className,
          teacherName: props.teacherName,
          assistantName: props.assistantName,
          startTime: props.startTime,
          endTime: props.endTime,
          date: props.date,
          courseFee: props.courseFee,
          teacherFee: props.teacherFee,
          assistantFee: props.assistantFee,
          county: props.county,
          district: props.district,
          notes: props.notes,
          hourlyRate: props.hourlyRate,
          teacher: null,
          assistants: [],
          series_id: null
        };
      } finally {
        isLoading.value = false;
      }
    };

    // 監聽懸浮狀態變化 Watch hovering state changes
    watch(isHovering, (newValue) => {
      if (newValue) {
        fetchCourseDetails();
      } else {
        tooltipData.value = null;
      }
    });

    return {
      blockContent,
      scrollContainer,
      tooltipData,
      isLoading,
      isHovering,
      truncateText,
      courseTypeLabel,
      blockStyle,
      formatTime,
      handleBlockClick,
      handleDragStart,
      handleDragEnd,
      // 直接暴露所有需要的 props 給模板使用
      ...props,
      seriesInfo,
      formatCurrency
    };
  }
});
</script>

<style lang="scss" scoped>
.schedule-block-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1; // 設置基礎層級
}

.schedule-block-container {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1; // 與父元素相同的層級
}

.schedule-block {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 4px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1; // 基礎層級

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 2; // 懸浮時提升一層
  }

  &.dragging {
    opacity: 0.5;
  }

  .block-content {
    height: 100%;
    overflow: hidden;
    font-size: var(--font-size-sm);
  }

  .course-type {
    font-weight: var(--font-weight-medium);
    margin-bottom: 2px;
  }

  .time-range {
    color: var(--text-secondary);
    font-size: var(--font-size-xs);
  }

  .tooltip {
    position: absolute;
    min-width: 200px;
    max-width: 300px;
    padding: var(--spacing-md);
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    
    p {
      margin: 4px 0;
      line-height: 1.4;
      
      strong {
        font-weight: var(--font-weight-medium);
        margin-right: 4px;
      }
    }
  }

  .tooltip-section {
    margin-bottom: var(--spacing-sm);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  // 下拉選單樣式 Dropdown styles
  .select-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
  }

  .select-option {
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: var(--bg-primary);
    
    &:hover {
      background-color: var(--color-gray-100);
    }
    
    &.selected {
      background-color: var(--color-primary-light);
      color: var(--color-primary);
    }
  }

  &.has-teacher {
    background-color: #5fd3bc;
    
    &:hover {
      background-color: #4fc3ac;
      transform: scale(1.02);
      box-shadow: var(--shadow-sm);
    }
  }

  &.pending-teacher {
    background-color: #e0e0e0;
    
    .teacher {
      color: #666666;
    }

    &:hover {
      background-color: #d8d8d8;
      transform: scale(1.02);
      box-shadow: var(--shadow-sm);
    }
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }
}

:deep(.tooltip) {
  z-index: 999999999 !important; // 確保 tooltip 永遠在最上層
  position: fixed !important;
}
</style> 