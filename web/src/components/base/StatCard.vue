<template>
  <div class="stat-card card">
    <div class="stat-icon" :style="{ backgroundColor: iconBgColor }">
      <slot name="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :style="{ color: iconColor }">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </slot>
    </div>
    <div class="stat-content">
      <h3 class="stat-title">{{ title }}</h3>
      <p class="stat-value">{{ value }}</p>
      <p v-if="change" class="stat-change">
        較{{ compareText }} <span :class="changeClass">{{ change }}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatCard',
  props: {
    // 統計標題 Statistic title
    title: {
      type: String,
      required: true
    },
    // 統計數值 Statistic value
    value: {
      type: [String, Number],
      required: true
    },
    // 變化值 Change value
    change: {
      type: String,
      default: ''
    },
    // 比較文本 Comparison text
    compareText: {
      type: String,
      default: '上月'
    },
    // 變化類型 Change type (success, warning, info, danger)
    changeType: {
      type: String,
      default: 'success',
      validator: (value) => ['success', 'warning', 'info', 'danger'].includes(value)
    },
    // 圖標背景色 Icon background color
    iconBgColor: {
      type: String,
      default: 'rgba(0, 113, 227, 0.1)'
    },
    // 圖標顏色 Icon color
    iconColor: {
      type: String,
      default: 'var(--color-primary)'
    }
  },
  computed: {
    // 變化值的CSS類 CSS class for change value
    changeClass() {
      return `text-${this.changeType}`;
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.stat-card {
  display: flex;
  align-items: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease; // 過渡效果 Transition effect
  
  &:hover {
    transform: translateY(-2px); // 懸停時上移 Move up on hover
    box-shadow: var(--shadow-lg); // 懸停時增加陰影 Increase shadow on hover
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
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
  
  .stat-title {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
  }
  
  .stat-value {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--spacing-xs);
    color: var(--text-primary);
  }
  
  .stat-change {
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    
    .text-success {
      color: var(--color-success);
    }
    
    .text-warning {
      color: var(--color-warning);
    }
    
    .text-info {
      color: var(--color-info);
    }
    
    .text-danger {
      color: var(--color-danger);
    }
  }
}
</style> 