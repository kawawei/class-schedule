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
            <!-- 查看按鈕 View button -->
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
            <!-- 刪除按鈕 Delete button (紅色 danger) -->
            <button
              class="icon-button delete-btn danger"
              @click="openDeleteDialog(row)"
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

      <!-- 刪除確認對話框 Delete Confirmation Dialog -->
      <AppDialog
        v-model="showDeleteDialog"
        title="刪除確認"
        width="400px"
        @close="handleDialogClose"
      >
        <template #default>
          <div style="text-align:center;">
            <span>確定要刪除此採購單嗎？</span>
            <br />
            <span style="color: #888; font-size: 13px;">此操作無法復原。</span>
          </div>
        </template>
        <template #footer>
          <div style="display:flex; justify-content: flex-end; gap: 12px;">
            <AppButton @click="showDeleteDialog = false">取消 Cancel</AppButton>
            <AppButton type="danger" :disabled="isDeleting" @click.stop="handleDeleteProcurement">確定刪除 Delete</AppButton>
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
import axios from 'axios';
import { ref } from 'vue';
import Message from '@/utils/message';
import { 
  format,
  addHours,
  parseISO
} from 'date-fns';

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

    // 格式化創建時間 Format creation time
    const formatCreatedAt = (date) => {
      return format(addHours(parseISO(date), 8), 'yyyy/MM/dd HH:mm');
    };

    // 取得 useProcurementManagement 回傳的 loading 狀態與方法 Get loading state and methods from useProcurementManagement
    const {
      loading, // 載入狀態 loading state
      fetchProcurements, // 重新取得採購單列表 fetch procurement list
      ...rest // 其餘方法與狀態 other methods and states
    } = useProcurementManagement();

    // 刪除對話框狀態與選中項目 Delete dialog state and selected item
    const showDeleteDialog = ref(false); // 是否顯示刪除對話框 Whether to show delete dialog
    const procurementToDelete = ref(null); // 欲刪除的採購單 The procurement to delete

    // 防止重複刪除的鎖 Prevent duplicate delete
    const isDeleting = ref(false);

    // 本地刪除鎖，防止同步重複觸發 Local lock to prevent sync double trigger
    let localDeleteLock = false;

    // 開啟刪除對話框 Open delete dialog
    const openDeleteDialog = (row) => {
      procurementToDelete.value = row;
      showDeleteDialog.value = true;
    };

    // Dialog 關閉時重置鎖與狀態 Reset lock and state when dialog closes
    const handleDialogClose = () => {
      console.log('[Debug] handleDialogClose called', { time: new Date().toISOString() }); // 追蹤 Dialog 關閉事件
      isDeleting.value = false;
      procurementToDelete.value = null;
      showDeleteDialog.value = false;
    };

    const handleDeleteProcurement = async () => {
      // 本地鎖判斷，確保同步只進來一次 Local lock, only allow the first in
      if (localDeleteLock) {
        console.log('[Debug] Blocked duplicate delete (local lock)');
        return;
      }
      localDeleteLock = true;
      console.log('[Debug] handleDeleteProcurement called', {
        isDeleting: isDeleting.value,
        procurementToDelete: procurementToDelete.value,
        time: new Date().toISOString()
      }); // 追蹤刪除觸發事件
      if (isDeleting.value) {
        console.log('[Debug] Blocked duplicate delete (isDeleting)');
        return;
      }
      isDeleting.value = true; // 嚴格鎖定，僅允許第一個進來 Strict lock, only allow the first in
      if (!procurementToDelete.value) return;
      showDeleteDialog.value = false; // 立即關閉 Dialog，避免重複觸發 Immediately close dialog to prevent double trigger
      try {
        loading.value = true;
        const token = localStorage.getItem('token');
        await axios.delete(`/procurements/${procurementToDelete.value.id}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        Message.success('刪除成功');
        fetchProcurements();
      } catch (error) {
        Message.error('刪除失敗');
      } finally {
        loading.value = false;
        // 延遲解鎖，確保 DOM/動畫已完成 Prevent double trigger by delay unlock
        setTimeout(() => {
          isDeleting.value = false;
          procurementToDelete.value = null;
          localDeleteLock = false; // 解鎖本地鎖 Unlock local lock
        }, 300);
      }
    };

    return {
      ...rest, // 其餘 useProcurementManagement 回傳內容 other returned values
      loading,
      fetchProcurements,
      mapStatusToBadge,
      openDeleteDialog,
      showDeleteDialog,
      handleDeleteProcurement,
      handleDialogClose,
      isDeleting,
      formatCreatedAt // 導出格式化函數
    };
  }
};
</script>

<style lang="scss" scoped>
@import './procurement.scss';
// 紅色危險按鈕樣式 Red danger button style
.icon-button.danger {
  color: #fff;
  background: #ff4d4f;
  border: none;
  transition: background 0.2s;
}
.icon-button.danger:hover {
  background: #d9363e;
}
</style> 