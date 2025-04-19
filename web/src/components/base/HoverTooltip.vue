<!-- 懸浮窗口組件 Hover Tooltip Component -->
<template>
  <div 
    class="tooltip-wrapper"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>
    <Transition name="fade">
      <div 
        v-if="shouldShow" 
        class="tooltip"
        :style="tooltipStyle"
      >
        <slot name="content"></slot>
      </div>
    </Transition>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'HoverTooltip',
  
  props: {
    // 延遲顯示時間（毫秒）Delay before showing (ms)
    showDelay: {
      type: Number,
      default: 200
    },
    // 延遲隱藏時間（毫秒）Delay before hiding (ms)
    hideDelay: {
      type: Number,
      default: 200
    },
    // 與滑鼠的偏移量 Offset from mouse position
    offset: {
      type: Object,
      default: () => ({ x: 10, y: -10 })
    },
    // 是否顯示 Whether to show
    modelValue: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const isHovering = ref(false);
    const tooltipStyle = ref({});
    let showTimer = null;
    let hideTimer = null;

    // 計算是否應該顯示 Compute whether should show
    const shouldShow = computed(() => props.modelValue && isHovering.value);

    // 處理滑鼠進入 Handle mouse enter
    const handleMouseEnter = (event) => {
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      showTimer = setTimeout(() => {
        isHovering.value = true;
        emit('update:modelValue', true);
        updateTooltipPosition(event);
      }, props.showDelay);
    };

    // 處理滑鼠移動 Handle mouse move
    const handleMouseMove = (event) => {
      if (shouldShow.value) {
        updateTooltipPosition(event);
      }
    };

    // 處理滑鼠離開 Handle mouse leave
    const handleMouseLeave = () => {
      if (showTimer) {
        clearTimeout(showTimer);
        showTimer = null;
      }
      hideTimer = setTimeout(() => {
        isHovering.value = false;
        emit('update:modelValue', false);
      }, props.hideDelay);
    };

    // 更新提示框位置 Update tooltip position
    const updateTooltipPosition = (event) => {
      const { clientX, clientY } = event;
      const tooltip = document.querySelector('.tooltip');
      if (!tooltip) return;

      // 獲取視窗尺寸 Get window dimensions
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      // 獲取提示框尺寸 Get tooltip dimensions
      const tooltipRect = tooltip.getBoundingClientRect();
      const tooltipWidth = tooltipRect.width;
      const tooltipHeight = tooltipRect.height;

      // 計算位置 Calculate position
      let left = clientX + props.offset.x;
      let top = clientY + props.offset.y;

      // 檢查右邊界 Check right boundary
      if (left + tooltipWidth > windowWidth) {
        left = clientX - tooltipWidth - Math.abs(props.offset.x);
      }

      // 檢查下邊界 Check bottom boundary
      if (top + tooltipHeight > windowHeight) {
        top = clientY - tooltipHeight - Math.abs(props.offset.y);
      }

      // 檢查左邊界 Check left boundary
      if (left < 0) {
        left = props.offset.x;
      }

      // 檢查上邊界 Check top boundary
      if (top < 0) {
        top = props.offset.y;
      }

      tooltipStyle.value = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        transform: 'none'
      };
    };

    // 組件卸載時清理計時器 Clean up timers on unmount
    onBeforeUnmount(() => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    });

    return {
      shouldShow,
      tooltipStyle,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave
    };
  }
});
</script>

<style lang="scss" scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
  width: fit-content;
  height: fit-content;
}

.tooltip {
  position: fixed;
  z-index: 9999;
  padding: 16px 20px;
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: none;
  max-width: 400px;
  min-width: 280px;
  white-space: normal;
  word-wrap: break-word;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  line-height: 1.5;
  
  // 改進內容樣式 Improve content styling
  :deep(.tooltip-content) {
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

    h4 {
      margin: 12px 0 8px;
      font-size: 15px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
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

// 動畫效果 Animation
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