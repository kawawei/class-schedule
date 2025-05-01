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
                'has-teacher': teacherName && teacherName !== '待訂',
                'selected': isSelected
              }
            ]"
            :style="blockStyle"
            :data-date="date"
            :data-start-time="startTime"
            draggable="true"
            @dragstart="handleDragStart"
            @dragend="handleDragEnd"
            @click="handleBlockClick"
            @dblclick="handleBlockDoubleClick"
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
import scheduleBlockComponent from './ScheduleBlock.js';
export default scheduleBlockComponent;
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

  &.selected {
    border: 2px solid var(--color-primary);
    box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
  }
}

:deep(.tooltip) {
  z-index: 999999999 !important; // 確保 tooltip 永遠在最上層
  position: fixed !important;
}
</style> 