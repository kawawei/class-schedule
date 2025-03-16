<template>
  <div class="section-header d-flex justify-content-between align-items-center">
    <div class="section-title-wrapper">
      <h2 class="section-title">{{ title }}</h2>
      <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
    </div>
    <div class="section-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SectionHeader',
  props: {
    // 區塊標題 Section title
    title: {
      type: String,
      required: true
    },
    // 區塊副標題 Section subtitle
    subtitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.section-header {
  margin-bottom: var(--spacing-md);
  
  .section-title-wrapper {
    flex: 1;
  }
  
  .section-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
    margin: 0;
    margin-bottom: var(--spacing-xs);
  }
  
  .section-subtitle {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin: 0;
  }
  
  .section-actions {
    display: flex;
    align-items: center;
  }
}
</style> 