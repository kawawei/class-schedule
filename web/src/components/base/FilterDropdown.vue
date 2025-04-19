<!-- 篩選下拉組件 Filter Dropdown Component -->
<template>
  <div class="filter-dropdown-wrapper">
    <!-- 篩選按鈕 Filter Button -->
    <button 
      type="button" 
      class="filter-button"
      @click="toggleDropdown"
      ref="filterButton"
    >
      <span class="button-content">
        <i class="fas fa-filter"></i>
        篩選 / Filter
        <span v-if="selectedCount" class="filter-count">{{ selectedCount }}</span>
      </span>
    </button>

    <!-- 已選擇的篩選標籤 Selected Filter Tags -->
    <div v-if="hasSelectedFilters" class="selected-filters">
      <div 
        v-for="(tags, category) in selectedFilters" 
        :key="category"
        class="filter-tags"
      >
        <span 
          v-for="tag in tags" 
          :key="tag.value"
          class="filter-tag"
        >
          {{ tag.label }}
          <button 
            type="button"
            class="remove-tag"
            @click="removeFilter(category, tag.value)"
          >
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>

    <!-- 篩選下拉面板 Filter Dropdown Panel -->
    <div 
      v-show="isOpen" 
      class="filter-panel"
      ref="filterPanel"
    >
      <!-- 篩選類別 Filter Categories -->
      <div class="filter-categories">
        <div 
          v-for="category in filterCategories"
          :key="category.key"
          class="filter-category"
        >
          <h3 class="category-title">{{ category.label }}</h3>
          <div class="filter-options">
            <label 
              v-for="option in category.options"
              :key="option.value"
              class="filter-option"
            >
              <input
                type="checkbox"
                :checked="isOptionSelected(category.key, option.value)"
                @change="toggleFilter(category.key, option)"
              >
              <span class="option-label">{{ option.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- 篩選操作按鈕 Filter Action Buttons -->
      <div class="filter-actions">
        <button 
          type="button"
          class="clear-filters"
          @click="clearAllFilters"
          :disabled="!hasSelectedFilters"
        >
          清除全部 / Clear All
        </button>
        <button 
          type="button"
          class="apply-filters"
          @click="applyFilters"
        >
          套用 / Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';

export default defineComponent({
  name: 'FilterDropdown',

  props: {
    // 篩選類別配置 Filter categories configuration
    filterCategories: {
      type: Array,
      required: true,
      validator: (value) => {
        return value.every(category => {
          return category.key && 
                 category.label && 
                 Array.isArray(category.options) &&
                 category.options.every(option => option.value && option.label);
        });
      }
    }
  },

  emits: ['filter-change'],

  setup(props, { emit }) {
    const isOpen = ref(false);
    const filterButton = ref(null);
    const filterPanel = ref(null);
    const selectedFilters = ref({});

    // 計算已選擇的篩選數量 Calculate selected filter count
    const selectedCount = computed(() => {
      return Object.values(selectedFilters.value).reduce((total, filters) => {
        return total + filters.length;
      }, 0);
    });

    // 是否有已選擇的篩選 Check if there are selected filters
    const hasSelectedFilters = computed(() => {
      return selectedCount.value > 0;
    });

    // 檢查選項是否被選中 Check if option is selected
    const isOptionSelected = (category, value) => {
      return selectedFilters.value[category]?.some(filter => filter.value === value) || false;
    };

    // 切換篩選面板 Toggle filter panel
    const toggleDropdown = () => {
      isOpen.value = !isOpen.value;
    };

    // 切換篩選選項 Toggle filter option
    const toggleFilter = (category, option) => {
      if (!selectedFilters.value[category]) {
        selectedFilters.value[category] = [];
      }

      const index = selectedFilters.value[category].findIndex(
        filter => filter.value === option.value
      );

      if (index === -1) {
        selectedFilters.value[category].push(option);
      } else {
        selectedFilters.value[category].splice(index, 1);
      }

      if (selectedFilters.value[category].length === 0) {
        delete selectedFilters.value[category];
      }
    };

    // 移除篩選標籤 Remove filter tag
    const removeFilter = (category, value) => {
      const index = selectedFilters.value[category].findIndex(
        filter => filter.value === value
      );

      if (index !== -1) {
        selectedFilters.value[category].splice(index, 1);
        if (selectedFilters.value[category].length === 0) {
          delete selectedFilters.value[category];
        }
        emit('filter-change', selectedFilters.value);
      }
    };

    // 清除所有篩選 Clear all filters
    const clearAllFilters = () => {
      selectedFilters.value = {};
      emit('filter-change', {});
    };

    // 套用篩選 Apply filters
    const applyFilters = () => {
      emit('filter-change', selectedFilters.value);
      isOpen.value = false;
    };

    // 點擊外部關閉下拉面板 Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        filterPanel.value &&
        filterButton.value &&
        !filterPanel.value.contains(event.target) &&
        !filterButton.value.contains(event.target)
      ) {
        isOpen.value = false;
      }
    };

    // 監聽點擊事件 Listen for click events
    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      isOpen,
      filterButton,
      filterPanel,
      selectedFilters,
      selectedCount,
      hasSelectedFilters,
      toggleDropdown,
      toggleFilter,
      removeFilter,
      clearAllFilters,
      applyFilters,
      isOptionSelected
    };
  }
});
</script>

<style lang="scss">
.filter-dropdown-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.filter-button {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background-color: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;

  .button-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-sm);
    color: var(--text-primary);

    i {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }
  }

  .filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 var(--spacing-xs);
    background-color: var(--color-primary);
    color: white;
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-medium);
  }

  &:hover {
    background-color: var(--color-gray-50);
    transform: translateY(-1px);
  }
}

.selected-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);

  .filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--color-primary-light);
    color: var(--color-primary);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    
    .remove-tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      padding: 0;
      border: none;
      background: none;
      color: var(--color-primary);
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.filter-panel {
  position: absolute;
  top: calc(100% + var(--spacing-sm));
  left: 0;
  min-width: 300px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  padding: var(--spacing-md);

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 16px;
    width: 16px;
    height: 16px;
    background-color: var(--bg-primary);
    border-left: 1px solid var(--border-color);
    border-top: 1px solid var(--border-color);
    transform: rotate(45deg);
  }

  .filter-categories {
    max-height: 400px;
    overflow-y: auto;
    padding-right: var(--spacing-sm);
    background-color: var(--bg-primary);

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: var(--color-gray-300);
      border-radius: 2px;
    }
  }

  .filter-category {
    background-color: var(--bg-primary);
    
    &:not(:last-child) {
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-gray-200);
    }

    .category-title {
      margin: 0 0 var(--spacing-sm);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .filter-options {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: var(--spacing-xs);
      background-color: var(--bg-primary);
    }

    .filter-option {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs);
      cursor: pointer;
      border-radius: var(--radius-sm);
      transition: background-color 0.2s ease;
      background-color: var(--bg-primary);

      &:hover {
        background-color: var(--color-gray-50);
      }

      input[type="checkbox"] {
        width: 16px;
        height: 16px;
        margin: 0;
      }

      .option-label {
        font-size: var(--font-size-sm);
        color: var(--text-primary);
      }
    }
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--color-gray-200);
    background-color: var(--bg-primary);

    button {
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-full);
      font-size: var(--font-size-sm);
      cursor: pointer;
      transition: all 0.2s ease;

      &.clear-filters {
        background-color: var(--bg-primary);
        border: 1px solid var(--color-gray-200);
        color: var(--text-secondary);

        &:hover:not(:disabled) {
          background-color: var(--color-gray-50);
          color: var(--text-primary);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      &.apply-filters {
        background-color: var(--color-primary);
        border: none;
        color: white;

        &:hover {
          background-color: var(--color-primary-dark);
          transform: translateY(-1px);
        }
      }
    }
  }
}
</style> 