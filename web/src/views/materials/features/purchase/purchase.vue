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
        @open-scanner="handleOpenScanner"
      />
    </AppDialog>

    <!-- 掃描器對話框 Scanner Dialog -->
    <!-- 對話框寬度加大為520px，提升顯示空間 Dialog width increased to 520px for better display -->
    <AppDialog
      v-model="scannerVisible"
      title="掃描條碼"
      width="520px"
    >
      <div class="scanner-content">
        <!-- 掃描模式切換按鈕區塊 Scan mode switch buttons -->
        <div class="scanner-modes">
          <!-- 單次掃描 Single scan -->
          <AppButton :type="scanMode==='single'?'primary':'default'" @click="setScanMode('single')">單次掃描 Single</AppButton>
          <!-- 連續掃描 Continuous scan -->
          <AppButton :type="scanMode==='continuous'?'primary':'default'" @click="setScanMode('continuous')">連續掃描 Continuous</AppButton>
          <!-- 自動掃描 Auto scan -->
          <AppButton :type="scanMode==='auto'?'primary':'default'" @click="setScanMode('auto')">自動掃描 Auto</AppButton>
        </div>
        <video ref="scannerVideo" class="scanner-video"></video>
        <div class="scanner-result" v-if="scannerResult">
          <p>掃描結果：{{ scannerResult }}</p>
        </div>
      </div>
      <template #footer>
        <AppButton @click="closeScanner">關閉</AppButton>
      </template>
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
// 引入 ZXing 掃描器 Import ZXing scanner
import { BrowserMultiFormatReader } from '@zxing/library';

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
    const scannerVisible = ref(false);
    const scannerVideo = ref(null);
    const scannerResult = ref('');
    const currentScanningRow = ref(null);
    let codeReader = null; // ZXing 掃描器實例
    let stream = null; // 攝影機串流

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

    // 處理打開掃描器 Handle open scanner
    const handleOpenScanner = (row) => {
      currentScanningRow.value = row;
      scannerVisible.value = true;
      // 這裡可以添加初始化掃描器的邏輯
      // Add scanner initialization logic here
    };

    // 關閉掃描器 Close scanner
    const closeScanner = () => {
      scannerVisible.value = false;
      scannerResult.value = '';
      currentScanningRow.value = null;
      // 這裡可以添加停止掃描器的邏輯
      // Add scanner stop logic here
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

    // 掃描器初始化與釋放
    const startScanner = async () => {
      if (!scannerVideo.value) return;
      codeReader = new BrowserMultiFormatReader();
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        scannerVideo.value.srcObject = stream;
        scannerVideo.value.setAttribute('playsinline', true);
        codeReader.decodeFromVideoElement(scannerVideo.value, (result, err) => {
          if (result) {
            handleScanResult(result.getText());
          }
        }).catch(e => {
          if (e && e.name === 'NotFoundException') {
            // 安靜忽略，不顯示錯誤
          } else {
            Message.error(e.message || '掃描器發生錯誤');
          }
        });
      } catch (err) {
        Message.error('無法啟動攝影機或存取被拒絕');
      }
    };
    const stopScanner = () => {
      if (codeReader) {
        codeReader.reset();
        codeReader = null;
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
      }
      if (scannerVideo.value) {
        scannerVideo.value.srcObject = null;
      }
    };

    // 掃描結果處理
    const handleScanResult = (code) => {
      scannerResult.value = code;
      // 取得進貨表單 ref
      const purchaseForm = document.querySelector('.purchase-form');
      // 透過 $refs 取得組件實例
      const formVm = purchaseForm && purchaseForm.__vueParentComponent?.ctx?.$refs?.purchaseForm;
      if (formVm && formVm.formData && formVm.materialOptions) {
        // 嘗試根據條碼找到商品
        const found = formVm.materialOptions.find(m => m.value === code || m.label === code);
        if (found) {
          // 檢查進貨項目是否已存在該商品
          const existRow = formVm.formData.items.find(item => item.materialId === found.value);
          if (existRow) {
            // 已存在則數量+1
            if (existRow.specifications && existRow.specifications.length > 0) {
              existRow.specifications[0].quantity += 1;
            } else {
              existRow.quantity = (existRow.quantity || 0) + 1;
            }
          } else {
            // 不存在則自動新增一筆
            formVm.handleAddItem();
            const newRow = formVm.formData.items[formVm.formData.items.length - 1];
            newRow.materialId = found.value;
            newRow.materialName = found.label;
            // 自動選第一個規格
            if (formVm.specificationOptions && formVm.specificationOptions[found.value] && formVm.specificationOptions[found.value].length > 0) {
              newRow.specifications[0].specification = formVm.specificationOptions[found.value][0].value;
            }
          }
        } else {
          Message.error('查無對應商品');
        }
      }
    };

    // 監聽掃描器開關
    watch(scannerVisible, (val) => {
      if (val) {
        setTimeout(() => startScanner(), 200);
      } else {
        stopScanner();
      }
    });
    onBeforeUnmount(() => {
      stopScanner();
    });

    // 掃描模式狀態 Scan mode state
    const scanMode = ref('single'); // 預設單次掃描 Default: single scan
    // 切換掃描模式 Switch scan mode
    const setScanMode = (mode) => {
      scanMode.value = mode;
    };

    return {
      loading,
      searchQuery,
      selectedSupplier,
      dateRange,
      dateOptions,
      isActiveDateRange,
      handleDateRangeSelect,
      supplierOptions,
      purchases,
      filteredPurchases,
      purchaseColumns,
      getStatusText,
      dialogVisible,
      scannerVisible,
      scannerVideo,
      scannerResult,
      existingPurchaseNumbers,
      handleDialogClose,
      handleFormSubmit,
      handleOpenScanner,
      closeScanner,
      openAddPurchaseDialog,
      viewPurchaseDetails,
      approvePurchase,
      rejectPurchase,
      applyFilters,
      scanMode, // 掃描模式狀態 Scan mode state
      setScanMode, // 切換掃描模式 Switch scan mode
    };
  }
});
</script>

<style lang="scss" scoped>
@import './purchase.scss';

// 掃描器樣式 Scanner Styles
.scanner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;

  .scanner-video {
    width: 100%;
    max-width: 320px;
    height: 240px;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
  }

  .scanner-result {
    width: 100%;
    padding: 12px;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    text-align: center;
  }
}
</style> 