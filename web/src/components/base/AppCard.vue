<template>
  <div class="app-card" :class="{ 'card-hoverable': hoverable, 'card-flat': flat }">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
        <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppCard',
  props: {
    // 卡片標題 Card title
    title: {
      type: String,
      default: ''
    },
    // 卡片副標題 Card subtitle
    subtitle: {
      type: String,
      default: ''
    },
    // 是否可懸停 Whether the card is hoverable
    hoverable: {
      type: Boolean,
      default: true
    },
    // 是否扁平 Whether the card is flat (no shadow)
    flat: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.app-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  margin-bottom: var(--spacing-lg);
  
  &.card-hoverable:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &.card-flat {
    box-shadow: none;
    border: 1px solid var(--border-color);
  }
  
  .card-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
    
    .card-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-medium);
      margin: 0;
      margin-bottom: var(--spacing-xs);
      color: var(--text-primary);
    }
    
    .card-subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      margin: 0;
    }
  }
  
  .card-body {
    padding: var(--spacing-lg);
  }
  
  .card-footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }
}

@media (max-width: 768px) {
  .app-card {
    .card-header,
    .card-body,
    .card-footer {
      padding: var(--spacing-md);
    }
  }
}
</style> 