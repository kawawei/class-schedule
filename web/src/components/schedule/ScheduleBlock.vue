<!-- 課程方塊組件 Schedule Block Component -->
<template>
  <div class="schedule-block-wrapper">
    <button 
      type="button"
      class="schedule-block"
      :class="[`course-type-${courseType}`, { 'has-assistant': assistantName }]"
      :style="blockStyle"
      :data-date="date"
      :data-start-time="startTime"
      @click="handleBlockClick"
    >
      <!-- 時間和課程類型 Time and Course Type -->
      <div class="block-header">
        <span class="time">{{ formatTime(startTime) }}-{{ formatTime(endTime) }}</span>
        <span class="course-type">{{ courseTypeLabel }}</span>
      </div>

      <!-- 補習班和教師信息 School and Teacher Info -->
      <div class="block-content">
        <div class="school-name">{{ schoolName }}</div>
        <div class="teacher-info">
          <span class="teacher">{{ teacherName }}</span>
          <span v-if="assistantName" class="assistant">{{ assistantName }}</span>
        </div>
      </div>
    </button>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ScheduleBlock',

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
      type: String,
      default: ''
    },
    // 日期 Date
    date: {
      type: String,
      default: ''
    }
  },

  emits: ['click'],

  setup(props, { emit }) {
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
      return time.split(':').slice(0, 2).join(':');
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
        assistantFee: props.assistantFee
      });
    };

    return {
      courseTypeLabel,
      blockStyle,
      formatTime,
      handleBlockClick,
      // 直接暴露所有需要的 props 給模板使用
      ...props
    };
  }
});
</script>

<style lang="scss" scoped>
.schedule-block-wrapper {
  position: relative;
}

.schedule-block {
  width: 100%;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  padding: 0.25rem;
  height: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  border-left: 2px solid transparent;
  box-shadow: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin: 1px;
  overflow: hidden;
  text-align: left;
  font-family: inherit;
  position: relative;

  &:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-sm);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary-light);
  }

  // 課程類型顏色定義
  &.course-type-math {
    border-left-color: var(--color-primary);
    background-color: rgba(24, 144, 255, 0.05);
  }

  &.course-type-english {
    border-left-color: var(--color-success);
    background-color: rgba(82, 196, 26, 0.05);
  }

  &.course-type-chinese {
    border-left-color: var(--color-warning);
    background-color: rgba(250, 173, 20, 0.05);
  }

  &.course-type-science {
    border-left-color: var(--color-info);
    background-color: rgba(47, 84, 235, 0.05);
  }

  &.has-assistant {
    background-color: var(--bg-tertiary);
  }

  .block-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    font-size: var(--font-size-xs);
    flex-shrink: 0;
    min-width: auto;
    gap: 50px;

    .time {
      color: var(--text-secondary);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
    }

    .course-type {
      color: var(--text-primary);
      font-weight: var(--font-weight-bold);
      padding: 0 2px;
      background: none;
      margin-left: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 60px;
    }
  }

  .block-content {
    display: flex;
    align-items: center;
    margin-left: 4px;
    flex: 1;
    overflow: hidden;
    min-width: 0;

    .school-name {
      font-size: var(--font-size-xs);
      color: var(--text-primary);
      font-weight: var(--font-weight-medium);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .teacher-info {
      display: none;
    }
  }
}
</style> 