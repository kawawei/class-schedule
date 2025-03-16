<template>
  <div class="activity-item d-flex align-items-center">
    <div class="activity-icon" :style="{ backgroundColor: computedIconBgColor }">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="{ color: computedIconColor }">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </slot>
    </div>
    <div class="activity-content">
      <p class="activity-text">
        <slot>{{ text }}</slot>
      </p>
      <p class="activity-time">{{ time }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ActivityItem',
  props: {
    // 活動文本 Activity text
    text: {
      type: String,
      default: ''
    },
    // 活動時間 Activity time
    time: {
      type: String,
      required: true
    },
    // 圖標背景色 Icon background color
    iconBgColor: {
      type: String,
      default: ''
    },
    // 圖標顏色 Icon color
    iconColor: {
      type: String,
      default: ''
    },
    // 活動類型 Activity type (primary, success, warning, info, danger)
    type: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'success', 'warning', 'info', 'danger'].includes(value)
    }
  },
  computed: {
    // 計算圖標背景色 Computed icon background color
    computedIconBgColor() {
      // 如果提供了自定義背景色，則使用它 If custom background color is provided, use it
      if (this.iconBgColor) {
        return this.iconBgColor;
      }
      
      // 否則根據類型設置背景色 Otherwise set background color based on type
      const colorMap = {
        'primary': 'rgba(0, 113, 227, 0.1)',
        'success': 'rgba(52, 199, 89, 0.1)',
        'warning': 'rgba(255, 149, 0, 0.1)',
        'info': 'rgba(90, 200, 250, 0.1)',
        'danger': 'rgba(255, 59, 48, 0.1)'
      };
      
      return colorMap[this.type] || colorMap.primary;
    },
    // 計算圖標顏色 Computed icon color
    computedIconColor() {
      // 如果提供了自定義顏色，則使用它 If custom color is provided, use it
      if (this.iconColor) {
        return this.iconColor;
      }
      
      // 否則根據類型設置顏色 Otherwise set color based on type
      const colorMap = {
        'primary': 'var(--color-primary)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'info': 'var(--color-info)',
        'danger': 'var(--color-danger)'
      };
      
      return colorMap[this.type] || colorMap.primary;
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.activity-item {
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease; // 過渡效果 Transition effect
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--bg-secondary);
  }
  
  .activity-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: var(--spacing-md);
    transition: transform 0.2s ease; // 圖標過渡效果 Icon transition effect
    
    &:hover {
      transform: scale(1.05); // 懸停時放大 Scale up on hover
    }
  }
  
  .activity-content {
    flex: 1;
  }
  
  .activity-text {
    font-size: var(--font-size-md);
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
    
    strong {
      font-weight: var(--font-weight-medium);
    }
  }
  
  .activity-time {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
  }
}
</style> 