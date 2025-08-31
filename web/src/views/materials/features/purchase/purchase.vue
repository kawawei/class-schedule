<!-- 進貨管理頁面 Purchase Management Page -->
<template>
  <div class="purchase-page">
    <div class="purchase-content">
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
          <label>搜尋進貨單</label>
          <AppInput
            v-model="searchQuery"
            placeholder="搜尋進貨單..."
            class="search-input"
          />
        </div>

        <!-- 新增按鈕 Add Button -->
        <div class="filter-group actions">
          <AppButton 
            type="primary"
            class="add-button"
            @click="openAddPurchaseDialog"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            新增進貨單
          </AppButton>
        </div>
      </div>

      <!-- 進貨單列表 Purchase Orders List -->
      <DataTable
        :columns="purchaseColumns"
        :data="filteredPurchases"
        :loading="loading"
        row-key="id"
      >
        <!-- 狀態列 Status Column -->
        <template #status="{ row }">
          <span :class="['status-tag', row.status]">
            {{ getStatusText(row.status) }}
          </span>
        </template>

        <!-- 操作列 Actions Column -->
        <template #actions="{ row }">
          <div class="action-buttons">
            <button
              class="icon-button view-btn"
              @click="viewPurchaseDetails(row)"
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
              @click="approvePurchase(row)"
              title="審核"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button
              v-if="row.status === 'pending'"
              class="icon-button reject-btn"
              @click="rejectPurchase(row)"
              title="拒絕"
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
    </div>

    <!-- 新增進貨單對話框 Add Purchase Dialog -->
    <AppDialog
      v-model="dialogVisible"
      title="新增進貨單"
      width="1100px"
      @close="handleDialogClose"
    >
      <PurchaseForm
        ref="purchaseForm"
        :existing-numbers="existingPurchaseNumbers"
        @submit="handleFormSubmit"
        @cancel="handleDialogClose"
      />
    </AppDialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import AppButton from '@/components/base/AppButton.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import DataTable from '@/components/base/DataTable.vue';
import PurchaseForm from './components/PurchaseForm.vue';
import Message from '@/utils/message';
import { parseISO, isWithinInterval, startOfDay, endOfDay, addDays, startOfMonth, endOfMonth, format } from 'date-fns';

export default defineComponent({
  name: 'PurchaseManagement',

  components: {
    AppButton,
    AppInput,
    AppSelect,
    AppDialog,
    DataTable,
    PurchaseForm
  },

  setup() {
    const loading = ref(false);
    const searchQuery = ref('');
    const selectedSupplier = ref('');
    const dateRange = ref({
      startDate: '',
      endDate: ''
    });
    const purchases = ref([
      {
        id: 'PO001',
        supplierName: '測試供應商1',
        totalAmount: 1000,
        status: 'pending',
        createdAt: '2024-03-20'
      },
      {
        id: 'PO002',
        supplierName: '測試供應商2',
        totalAmount: 2000,
        status: 'approved',
        createdAt: '2024-03-19'
      }
    ]);

    // 供應商選項 Supplier Options
    const supplierOptions = ref([
      { label: '測試供應商1', value: 'supplier1' },
      { label: '測試供應商2', value: 'supplier2' }
    ]);

    // 表格列定義 Table Columns
    const purchaseColumns = [
      { key: 'id', title: '進貨單號' },
      { key: 'supplierName', title: '供應商' },
      { key: 'totalAmount', title: '總金額' },
      { key: 'status', title: '狀態', slot: true },
      { key: 'createdAt', title: '創建時間' },
      { key: 'actions', title: '操作', slot: true }
    ];

    // 過濾後的進貨單列表 Filtered Purchase Orders
    const filteredPurchases = computed(() => {
      return purchases.value.filter(purchase => {
        // 日期範圍過濾 Date range filter
        if (dateRange.value.startDate && dateRange.value.endDate) {
          const purchaseDate = parseISO(purchase.createdAt);
          const start = parseISO(dateRange.value.startDate);
          const end = parseISO(dateRange.value.endDate);
          if (!isWithinInterval(purchaseDate, { start, end })) {
            return false;
          }
        }

        // 供應商過濾 Supplier filter
        if (selectedSupplier.value && purchase.supplierName !== selectedSupplier.value) {
          return false;
        }

        // 搜尋過濾 Search filter
        if (searchQuery.value) {
          const searchLower = searchQuery.value.toLowerCase();
          return (
            purchase.id.toLowerCase().includes(searchLower) ||
            purchase.supplierName.toLowerCase().includes(searchLower)
          );
        }

        return true;
      });
    });

    // 日期範圍選項
    const dateOptions = [
      { label: '今天', value: 'today' },
      { label: '最近7天', value: 'last7days' },
      { label: '最近30天', value: 'last30days' },
      { label: '本月', value: 'thisMonth' }
    ];

    // 當前選中的日期範圍
    const activeDateRange = ref('');

    // 檢查日期範圍是否被選中
    const isActiveDateRange = (value) => {
      return activeDateRange.value === value;
    };

    // 處理日期範圍選擇
    const handleDateRangeSelect = (value) => {
      const today = new Date();
      const startOfToday = startOfDay(today);
      
      activeDateRange.value = value;
      
      switch (value) {
        case 'today':
          dateRange.value = {
            startDate: format(startOfToday, 'yyyy-MM-dd'),
            endDate: format(endOfDay(today), 'yyyy-MM-dd')
          };
          break;
        case 'last7days':
          dateRange.value = {
            startDate: format(addDays(startOfToday, -6), 'yyyy-MM-dd'),
            endDate: format(today, 'yyyy-MM-dd')
          };
          break;
        case 'last30days':
          dateRange.value = {
            startDate: format(addDays(startOfToday, -29), 'yyyy-MM-dd'),
            endDate: format(today, 'yyyy-MM-dd')
          };
          break;
        case 'thisMonth':
          dateRange.value = {
            startDate: format(startOfMonth(today), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(today), 'yyyy-MM-dd')
          };
          break;
      }
      applyFilters();
    };

    // 方法 Methods
    const getStatusText = (status) => {
      const texts = {
        pending: '待審核',
        approved: '已審核',
        rejected: '已拒絕'
      };
      return texts[status] || status;
    };

    // 對話框狀態 Dialog states
    const dialogVisible = ref(false);

    // 現有進貨單號 Existing purchase numbers
    const existingPurchaseNumbers = computed(() => {
      return purchases.value.map(purchase => purchase.id);
    });

    // 處理對話框關閉 Handle dialog close
    const handleDialogClose = () => {
      dialogVisible.value = false;
    };

    // 處理表單提交 Handle form submit
    const handleFormSubmit = async (purchaseData) => {
      try {
        loading.value = true;
        // 這裡可以添加提交到後端的邏輯
        // Add backend submission logic here
        Message.success('進貨單創建成功');
        await fetchPurchases();
        dialogVisible.value = false;
      } catch (error) {
        Message.error('進貨單創建失敗');
      } finally {
        loading.value = false;
      }
    };

    // 修改原有的 openAddPurchaseDialog 方法
    const openAddPurchaseDialog = () => {
      dialogVisible.value = true;
    };

    const viewPurchaseDetails = (purchase) => {
      Message.info('此功能開發中');
    };

    const approvePurchase = (purchase) => {
      Message.info('此功能開發中');
    };

    const rejectPurchase = (purchase) => {
      Message.info('此功能開發中');
    };

    const applyFilters = () => {
      // 過濾邏輯已經在 computed 屬性中實現
    };

    return {
      loading,
      searchQuery,
      selectedSupplier,
      dateRange,
      purchases,
      supplierOptions,
      purchaseColumns,
      filteredPurchases,
      dateOptions,
      activeDateRange,
      dialogVisible,
      existingPurchaseNumbers,
      isActiveDateRange,
      handleDateRangeSelect,
      getStatusText,
      handleDialogClose,
      handleFormSubmit,
      openAddPurchaseDialog,
      viewPurchaseDetails,
      approvePurchase,
      rejectPurchase,
      applyFilters
    };
  }
});
</script>

<style lang="scss">
@import './purchase.scss';
</style> 