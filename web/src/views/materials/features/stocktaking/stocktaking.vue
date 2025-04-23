<!-- 盤點管理頁面 Stock Taking Management Page -->
<template>
  <div class="stocktaking-page">
    <div class="stocktaking-content">
      <!-- 過濾區域 Filter Area -->
      <div class="advanced-filters">
        <!-- 日期範圍過濾器 Date Range Filter -->
        <div class="filter-group date-range">
          <label>日期範圍</label>
          <div class="filter-content">
            <div class="quick-select-buttons">
              <button 
                v-for="option in dateOptions" 
                :key="option.value"
                :class="['quick-select-btn', { active: isActiveDateRange(option.value) }]"
                @click="handleDateRangeSelect(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
            <div class="date-inputs">
              <app-input
                v-model="dateRange[0]"
                type="date"
                class="date-input"
                placeholder="年/月/日"
              />
              <span class="separator">至</span>
              <app-input
                v-model="dateRange[1]"
                type="date"
                class="date-input"
                placeholder="年/月/日"
              />
            </div>
          </div>
        </div>

        <!-- 搜索過濾器 Search Filter -->
        <div class="filter-group search">
          <label>搜索盤點記錄</label>
          <app-input
            v-model="searchQuery"
            placeholder="搜索盤點記錄..."
            class="search-input"
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </template>
          </app-input>
        </div>

        <!-- 操作按鈕 Action Buttons -->
        <div class="filter-group actions">
          <app-button 
            type="primary"
            class="add-button"
            @click="openAddDialog"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            新增盤點
          </app-button>
        </div>
      </div>

      <!-- 數據表格 Data Table -->
      <data-table
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <!-- 狀態列自定義渲染 Status Column Custom Rendering -->
        <template #status="{ row }">
          <div class="status-tag" :class="row.status">
            {{ getStatusText(row.status) }}
          </div>
        </template>

        <!-- 操作列自定義渲染 Action Column Custom Rendering -->
        <template #actions="{ row }">
          <div class="action-column">
            <app-button 
              type="text" 
              @click="handleEdit(row)"
              v-if="row.status === 'draft'"
            >
              編輯
            </app-button>
            <app-button 
              type="text" 
              @click="handleView(row)"
              v-else
            >
              查看
            </app-button>
            <app-button 
              type="text" 
              class="delete-button"
              @click="handleDelete(row)"
              v-if="row.status === 'draft'"
            >
              刪除
            </app-button>
          </div>
        </template>
      </data-table>

      <!-- 刪除確認對話框 Delete Confirmation Dialog -->
      <app-dialog
        v-model="deleteDialogVisible"
        title="確認刪除"
        width="400px"
      >
        <div class="delete-confirm-content">
          確定要刪除這條盤點記錄嗎？此操作不可恢復。
        </div>
        <template #footer>
          <app-button @click="deleteDialogVisible = false">取消</app-button>
          <app-button 
            type="danger" 
            @click="confirmDelete" 
            :loading="deleting"
          >
            確認刪除
          </app-button>
        </template>
      </app-dialog>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import AppButton from '@/components/base/AppButton.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import DataTable from '@/components/base/DataTable.vue';
import useStocktakingManagement from './stocktaking';

export default {
  name: 'StocktakingManagement',
  
  components: {
    AppButton,
    AppInput,
    AppDialog,
    DataTable
  },
  
  setup() {
    return {
      ...useStocktakingManagement(),
      dateOptions: [
        { label: '今天', value: 'today' },
        { label: '最近7天', value: 'last7days' },
        { label: '最近30天', value: 'last30days' },
        { label: '本月', value: 'thisMonth' }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
@import './stocktaking.scss';
</style> 