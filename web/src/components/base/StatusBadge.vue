<template>
  <span class="status-badge" :class="badgeClass">
    {{ displayText }}
  </span>
</template>

<script>
export default {
  name: 'StatusBadge',
  props: {
    // 狀態類型 Status type (completed, in-progress, upcoming, cancelled)
    status: {
      type: String,
      required: true,
      validator: (value) => ['completed', 'in-progress', 'upcoming', 'cancelled'].includes(value)
    },
    // 自定義文本 Custom text
    text: {
      type: String,
      default: null
    }
  },
  computed: {
    // 標籤CSS類 Badge CSS class
    badgeClass() {
      return `status-${this.status}`;
    },
    // 顯示文本 Display text (使用自定義文本或默認文本) Use custom text or default text
    displayText() {
      if (this.text !== null) {
        return this.text;
      }
      
      const textMap = {
        'completed': '已完成',
        'in-progress': '進行中',
        'upcoming': '即將開始',
        'cancelled': '已取消'
      };
      
      return textMap[this.status] || this.status;
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  line-height: 1.2;
  transition: all 0.2s ease; // 過渡效果 Transition effect
  
  &.status-completed {
    background-color: rgba(52, 199, 89, 0.1);
    color: var(--color-success);
    border: 1px solid rgba(52, 199, 89, 0.2);
  }
  
  &.status-in-progress {
    background-color: rgba(0, 113, 227, 0.1);
    color: var(--color-primary);
    border: 1px solid rgba(0, 113, 227, 0.2);
  }
  
  &.status-upcoming {
    background-color: rgba(90, 200, 250, 0.1);
    color: var(--color-info);
    border: 1px solid rgba(90, 200, 250, 0.2);
  }
  
  &.status-cancelled {
    background-color: rgba(255, 59, 48, 0.1);
    color: var(--color-danger);
    border: 1px solid rgba(255, 59, 48, 0.2);
  }
  
  // 懸停效果 Hover effect
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}
</style> 