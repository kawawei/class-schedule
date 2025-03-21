<!-- 最近使用的公司代碼組件 Recent Company Codes Component -->
<template>
  <div class="recent-company-codes" v-if="recentCodes.length > 0">
    <div class="recent-codes-header">
      <span class="recent-codes-title">最近使用 Recently Used</span>
      <button class="clear-btn" @click="clearHistory" title="清除歷史記錄 Clear history">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
    <div class="recent-codes-list">
      <button
        v-for="code in recentCodes"
        :key="code.code"
        class="recent-code-item"
        @click="selectCode(code.code)"
      >
        <span class="code-text">{{ code.code }}</span>
        <span class="code-date">{{ formatDate(code.lastUsed) }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'RecentCompanyCodes',
  props: {
    // 最大顯示數量 Maximum number of items to display
    maxItems: {
      type: Number,
      default: 5
    }
  },
  emits: ['select'],
  setup(props, { emit }) {
    // 最近使用的公司代碼列表 Recent company codes list
    const recentCodes = ref([]);

    /**
     * 載入最近使用的公司代碼 Load recent company codes
     */
    const loadRecentCodes = () => {
      try {
        const savedCodes = localStorage.getItem('recentCompanyCodes');
        if (savedCodes) {
          recentCodes.value = JSON.parse(savedCodes)
            .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
            .slice(0, props.maxItems);
        }
      } catch (error) {
        console.error('載入最近使用的公司代碼失敗 Failed to load recent company codes:', error);
      }
    };

    /**
     * 清除歷史記錄 Clear history
     */
    const clearHistory = () => {
      try {
        localStorage.removeItem('recentCompanyCodes');
        recentCodes.value = [];
      } catch (error) {
        console.error('清除歷史記錄失敗 Failed to clear history:', error);
      }
    };

    /**
     * 選擇公司代碼 Select company code
     * @param {String} code - 公司代碼 Company code
     */
    const selectCode = (code) => {
      emit('select', code);
    };

    /**
     * 格式化日期 Format date
     * @param {String} dateString - 日期字符串 Date string
     * @returns {String} 格式化後的日期 Formatted date
     */
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      // 如果是一天內 If within one day
      if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours}小時前 ${hours} hours ago`;
      }
      
      // 如果是一週內 If within one week
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = Math.floor(diff / (24 * 60 * 60 * 1000));
        return `${days}天前 ${days} days ago`;
      }
      
      // 其他情況顯示完整日期 Show full date for other cases
      return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    // 組件掛載時載入數據 Load data when component is mounted
    onMounted(loadRecentCodes);

    return {
      recentCodes,
      clearHistory,
      selectCode,
      formatDate
    };
  }
};
</script>

<style lang="scss" scoped>
.recent-company-codes {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.recent-codes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.recent-codes-title {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.clear-btn {
  background: none;
  border: none;
  padding: var(--spacing-xs);
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
}

.recent-codes-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.recent-code-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--color-primary);
  }
}

.code-text {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.code-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}
</style> 