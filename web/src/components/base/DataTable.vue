<template>
  <div class="data-table-wrapper">
    <div v-if="$slots.header" class="data-table-header">
      <slot name="header"></slot>
    </div>
    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key" :style="getColumnStyle(column)">
              {{ column.title }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading" class="loading-row">
            <td :colspan="columns.length" class="text-center">
              <div class="loading-spinner"></div>
              <p>載入中...</p>
            </td>
          </tr>
          <tr v-else-if="!data || data.length === 0" class="empty-row">
            <td :colspan="columns.length" class="text-center">
              <p>{{ emptyText }}</p>
            </td>
          </tr>
          <tr v-for="(row, index) in data" :key="getRowKey(row, index)" @click="onRowClick($event, row, index)" :class="{ 'clickable': rowClickable }">
            <td v-for="column in columns" :key="column.key" :style="getColumnStyle(column)">
              <slot :name="column.key" :row="row" :index="index">
                {{ getColumnValue(row, column) }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="$slots.footer" class="data-table-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    // 表格列定義 Table column definitions
    columns: {
      type: Array,
      required: true,
      validator: (columns) => columns.every(col => col.key && col.title)
    },
    // 表格數據 Table data
    data: {
      type: Array,
      default: () => []
    },
    // 行唯一標識字段 Row unique identifier field
    rowKey: {
      type: String,
      default: 'id'
    },
    // 是否正在加載 Whether the table is loading
    loading: {
      type: Boolean,
      default: false
    },
    // 空數據文本 Empty data text
    emptyText: {
      type: String,
      default: '暫無數據'
    },
    // 行是否可點擊 Whether rows are clickable
    rowClickable: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 獲取列值 Get column value
    getColumnValue(row, column) {
      if (column.render && typeof column.render === 'function') {
        return column.render(row);
      }
      
      // 支持嵌套屬性 Support nested properties
      if (column.key.includes('.')) {
        return column.key.split('.').reduce((obj, key) => obj && obj[key], row);
      }
      
      return row[column.key];
    },
    // 獲取行唯一標識 Get row unique identifier
    getRowKey(row, index) {
      return row[this.rowKey] || index;
    },
    // 獲取列樣式 Get column style
    getColumnStyle(column) {
      const style = {};
      
      if (column.width) {
        style.width = typeof column.width === 'number' ? `${column.width}px` : column.width;
      }
      
      if (column.align) {
        style.textAlign = column.align;
      }
      
      return style;
    },
    // 行點擊事件 Row click event
    onRowClick(event, row, index) {
      // 如果點擊的是按鈕或者按鈕內的元素，不觸發行點擊事件
      // If clicking on a button or elements inside a button, don't trigger row click event
      if (event.target.closest('.action-buttons')) {
        return;
      }
      
      if (this.rowClickable) {
        this.$emit('row-click', row, index);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@use 'sass:color'; // 導入 sass:color 模塊 Import sass:color module

.data-table-wrapper {
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  box-shadow: var(--shadow-sm);
}

.data-table-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.data-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch; // 提升移動端滾動體驗 Improve mobile scrolling experience
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  
  th, td {
    padding: var(--spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.2s ease; // 過渡效果 Transition effect
  }
  
  th {
    font-weight: var(--font-weight-medium);
    color: var(--text-secondary);
    background-color: var(--bg-secondary);
    position: sticky; // 固定表頭 Sticky header
    top: 0;
    z-index: 1;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr.clickable {
    cursor: pointer;
    
    &:hover td {
      background-color: var(--bg-secondary);
    }
  }
  
  .loading-row, .empty-row {
    td {
      padding: var(--spacing-xl);
      color: var(--text-secondary);
    }
  }
  
  .loading-spinner {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 2px solid var(--color-primary);
    border-radius: 50%;
    border-top-color: transparent;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-sm);
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
}

.data-table-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
}
</style> 