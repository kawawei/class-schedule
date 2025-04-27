# 採購管理頁面組件 Procurement Management Page Component
<template>
  <div class="procurement-page">
    <div class="procurement-content">
      <!-- 篩選區域 Filter Area -->
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
              <AppInput
                v-model="dateRange.startDate"
                type="date"
                class="date-input"
                placeholder="年/月/日"
              />
              <span class="separator">至</span>
              <AppInput
                v-model="dateRange.endDate"
                type="date"
                class="date-input"
                placeholder="年/月/日"
              />
            </div>
          </div>
        </div>

        <!-- 供應商過濾器 Supplier Filter -->
        <div class="filter-group supplier">
          <label>供應商</label>
          <AppSelect
            v-model="selectedSupplier"
            :options="supplierOptions"
            placeholder="選擇供應商"
            class="supplier-select"
          />
        </div>

        <!-- 搜尋過濾器 Search Filter -->
        <div class="filter-group search">
          <label>搜尋採購單</label>
          <AppInput
            v-model="searchQuery"
            placeholder="搜尋採購單..."
            class="search-input"
          >
            <template #suffix>
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
            @click="openAddProcurementDialog"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            新增採購單
          </AppButton>
        </div>
      </div>

      <!-- 採購單列表 Procurement Orders List -->
      <DataTable
        :columns="procurementColumns"
        :data="filteredProcurements"
        :loading="loading"
        row-key="id"
      >
        <!-- 狀態列 Status Column -->
        <template #status="{ row }">
          <!-- 使用 StatusBadge 元件顯示狀態 Use StatusBadge component to display status -->
          <StatusBadge :status="mapStatusToBadge(row.status)" :text="getStatusText(row.status)" />
        </template>

        <!-- 操作列 Actions Column -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <button
              class="icon-button view-btn"
              @click="viewProcurementDetails(row)"
              title="查看"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button
              v-if="row.status === 'pending'"
              class="icon-button approve-btn"
              @click="approveProcurement(row)"
              title="審核"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button
              v-if="row.status === 'pending'"
              class="icon-button reject-btn"
              @click="rejectProcurement(row)"
              title="拒絕"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button
              v-if="row.status === 'approved'"
              class="icon-button purchase-btn"
              @click="handlePurchase(row)"
              title="進貨"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3h18v18H3z"></path>
                <path d="M12 8v8"></path>
                <path d="M8 12h8"></path>
              </svg>
            </button>
          </div>
        </template>
      </DataTable>

      <!-- 採購單表單對話框 Procurement Form Dialog -->
      <AppDialog
        v-model="showProcurementDialog"
        :title="dialogType === 'add' ? '新增採購單' : '編輯採購單'"
        width="80%"
        destroy-on-close
      >
        <template #default>
          <ProcurementForm
            :initial-data="currentProcurement"
            :existingNumbers="procurements.map(p => p.procurementNo)"
            @submit="handleProcurementSubmit"
            @cancel="closeProcurementDialog"
            ref="procurementFormRef"
          />
        </template>
        <template #footer>
          <div class="dialog-footer">
            <AppButton type="danger" @click="closeProcurementDialog">取消 Cancel</AppButton>
            <AppButton v-if="dialogType === 'view'" type="primary" @click="dialogType = 'edit'">編輯 Edit</AppButton>
            <AppButton v-else type="primary" @click="submitProcurementForm">儲存 Save</AppButton>
          </div>
        </template>
      </AppDialog>
    </div>
  </div>
</template>

<script>
import AppButton from '@/components/base/AppButton.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import DataTable from '@/components/base/DataTable.vue';
import { useProcurementManagement } from './procurement';
import ProcurementForm from './components/ProcurementForm.vue'
import StatusBadge from '@/components/base/StatusBadge.vue'

export default {
  name: 'ProcurementManagement',
  
  components: {
    AppButton,
    AppInput,
    AppSelect,
    AppDialog,
    DataTable,
    ProcurementForm,
    StatusBadge
  },

  setup() {
    // 狀態對應函數 Map procurement status to StatusBadge status
    const mapStatusToBadge = (status) => {
      switch (status) {
        case 'draft': return 'upcoming'; // 草稿 → 即將開始
        case 'pending': return 'in-progress'; // 待審核 → 進行中
        case 'approved': return 'completed'; // 已審核 → 已完成
        case 'rejected': return 'cancelled'; // 已拒絕 → 已取消
        default: return 'upcoming';
      }
    };
    return {
      ...useProcurementManagement(),
      mapStatusToBadge
    };
  }
};
</script>

<style lang="scss" scoped>
@import './procurement.scss';
</style> 