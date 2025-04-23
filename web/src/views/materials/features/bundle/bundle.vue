<!-- 組合商品管理頁面 Bundle Management Page -->
<template>
  <div class="bundle-page">
    <div class="bundle-content">
      <!-- 篩選區域 Filter Area -->
      <div class="advanced-filters">
        <!-- 搜尋過濾器 Search Filter -->
        <div class="filter-group search">
          <label>搜尋組合商品</label>
          <AppInput
            v-model="searchQuery"
            placeholder="搜尋組合商品..."
            class="search-input"
          >
            <template #prefix>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </template>
          </AppInput>
        </div>

        <!-- 新增按鈕 Add Button -->
        <div class="filter-group actions">
          <AppButton 
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
            新增組合商品
          </AppButton>
        </div>
      </div>

      <!-- 數據表格 Data Table -->
      <DataTable
        :loading="loading"
        :columns="columns"
        :data="filteredData"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <!-- 狀態列自定義渲染 Status Column Custom Rendering -->
        <template #status="{ row }">
          <span :class="['status-tag', row.status]">
            {{ getStatusText(row.status) }}
          </span>
        </template>

        <!-- 操作列自定義渲染 Action Column Custom Rendering -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <button
              class="icon-button view-btn"
              @click="viewBundle(row)"
              title="查看"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button
              class="icon-button edit-btn"
              @click="editBundle(row)"
              title="編輯"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button
              class="icon-button delete-btn"
              @click="deleteBundle(row)"
              title="刪除"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </template>
      </DataTable>

      <!-- 添加/編輯對話框 Add/Edit Dialog -->
      <AppDialog
        v-model:visible="dialogVisible"
        :title="isEdit ? '編輯組合商品' : '新增組合商品'"
        width="600px"
        @close="closeDialog"
      >
        <!-- 對話框內容將在後續實現 Dialog content will be implemented later -->
      </AppDialog>

      <!-- 刪除確認對話框 Delete Confirmation Dialog -->
      <AppDialog
        v-model:visible="deleteConfirmVisible"
        title="確認刪除"
        width="400px"
        @close="closeDeleteConfirm"
      >
        <div class="delete-confirm-content">
          確定要刪除這個組合商品嗎？此操作無法撤銷。
        </div>
        <template #footer>
          <AppButton @click="closeDeleteConfirm">取消</AppButton>
          <AppButton type="danger" @click="confirmDelete" :loading="loading">
            確認刪除
          </AppButton>
        </template>
      </AppDialog>
    </div>
  </div>
</template>

<script src="./bundle.js"></script>
<style lang="scss" src="./bundle.scss" scoped></style> 