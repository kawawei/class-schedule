# 創建出貨管理組件 Create shipment management component
<template>
  <div class="shipment-page">
    <div class="shipment-content">
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

        <!-- 倉庫過濾器 Warehouse Filter -->
        <div class="filter-group warehouse">
          <label>倉庫</label>
          <AppSelect
            v-model="selectedWarehouse"
            :options="warehouseOptions"
            placeholder="選擇倉庫"
            class="warehouse-select"
          />
        </div>

        <!-- 搜尋過濾器 Search Filter -->
        <div class="filter-group search">
          <label>搜尋出貨單</label>
          <AppInput
            v-model="searchQuery"
            placeholder="搜尋出貨單..."
            class="search-input"
          />
        </div>

        <!-- 新增按鈕 Add Button -->
        <div class="filter-group actions">
          <AppButton 
            type="primary"
            class="add-button"
            @click="openAddShipmentDialog"
          >
            <template #icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </template>
            新增出貨單
          </AppButton>
        </div>
      </div>

      <!-- 出貨單列表 Shipment Orders List -->
      <DataTable
        :columns="shipmentColumns"
        :data="filteredShipments"
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
              @click="viewShipmentDetails(row)"
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
              @click="approveShipment(row)"
              title="審核"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </button>
            <button
              v-if="row.status === 'pending'"
              class="icon-button reject-btn"
              @click="rejectShipment(row)"
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
  </div>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import AppButton from '@/components/base/AppButton.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppSelect from '@/components/base/AppSelect.vue';
import DataTable from '@/components/base/DataTable.vue';
import Message from '@/utils/message';
import { parseISO, isWithinInterval, startOfDay, endOfDay, addDays, startOfMonth, endOfMonth, format } from 'date-fns';

export default defineComponent({
  name: 'ShipmentManagement',

  components: {
    AppButton,
    AppInput,
    AppSelect,
    DataTable
  },

  setup() {
    const loading = ref(false);
    const searchQuery = ref('');
    const selectedWarehouse = ref('');
    const dateRange = ref({
      startDate: '',
      endDate: ''
    });
    const shipments = ref([
      {
        id: 'SH001',
        warehouseName: '台北倉',
        totalAmount: 1000,
        status: 'pending',
        createdAt: '2024-03-20'
      },
      {
        id: 'SH002',
        warehouseName: '台中倉',
        totalAmount: 2000,
        status: 'approved',
        createdAt: '2024-03-19'
      }
    ]);

    // 倉庫選項 Warehouse Options
    const warehouseOptions = ref([
      { label: '台北倉', value: 'taipei' },
      { label: '台中倉', value: 'taichung' },
      { label: '高雄倉', value: 'kaohsiung' }
    ]);

    // 表格列定義 Table Columns
    const shipmentColumns = [
      { key: 'id', title: '出貨單號' },
      { key: 'warehouseName', title: '倉庫' },
      { key: 'totalAmount', title: '總金額' },
      { key: 'status', title: '狀態', slot: true },
      { key: 'createdAt', title: '創建時間' },
      { key: 'actions', title: '操作', slot: true }
    ];

    // 過濾後的出貨單列表 Filtered Shipment Orders
    const filteredShipments = computed(() => {
      return shipments.value.filter(shipment => {
        // 日期範圍過濾 Date range filter
        if (dateRange.value.startDate && dateRange.value.endDate) {
          const shipmentDate = parseISO(shipment.createdAt);
          const start = parseISO(dateRange.value.startDate);
          const end = parseISO(dateRange.value.endDate);
          if (!isWithinInterval(shipmentDate, { start, end })) {
            return false;
          }
        }

        // 倉庫過濾 Warehouse filter
        if (selectedWarehouse.value && shipment.warehouseName !== selectedWarehouse.value) {
          return false;
        }

        // 搜尋過濾 Search filter
        if (searchQuery.value) {
          const searchLower = searchQuery.value.toLowerCase();
          return (
            shipment.id.toLowerCase().includes(searchLower) ||
            shipment.warehouseName.toLowerCase().includes(searchLower)
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

    const openAddShipmentDialog = () => {
      Message.info('此功能開發中');
    };

    const viewShipmentDetails = (shipment) => {
      Message.info('此功能開發中');
    };

    const approveShipment = (shipment) => {
      Message.info('此功能開發中');
    };

    const rejectShipment = (shipment) => {
      Message.info('此功能開發中');
    };

    const applyFilters = () => {
      // 過濾邏輯已經在 computed 屬性中實現
    };

    return {
      loading,
      searchQuery,
      selectedWarehouse,
      dateRange,
      dateOptions,
      isActiveDateRange,
      handleDateRangeSelect,
      warehouseOptions,
      shipments,
      filteredShipments,
      shipmentColumns,
      getStatusText,
      openAddShipmentDialog,
      viewShipmentDetails,
      approveShipment,
      rejectShipment,
      applyFilters
    };
  }
});
</script>

<style lang="scss" scoped>
// 出貨管理頁面樣式 Shipment Management Page Styles
.shipment-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  width: 100%;
  
  .shipment-content {
    padding: var(--spacing-xs);
    background-color: var(--bg-primary);
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
    min-width: 900px;
    
    .advanced-filters {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: nowrap;
      gap: var(--spacing-lg);
      padding: var(--spacing-md) var(--spacing-lg);
      background-color: var(--bg-secondary);
      border-radius: var(--radius-md);
      margin-bottom: var(--spacing-md);
      width: 100%;
      min-height: 80px;
      
      .filter-group {
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
        
        label {
          display: block;
          color: var(--text-secondary);
          font-size: var(--font-size-sm);
          font-weight: 500;
          line-height: 1.2;
          margin-bottom: 8px;
        }
        
        &.date-range {
          width: auto;
          
          .filter-content {
            display: flex;
            gap: var(--spacing-md);
            align-items: center;
          }
          
          .quick-select-buttons {
            display: flex;
            gap: var(--spacing-xs);
            margin-bottom: 0;
            flex-shrink: 0;
            
            .quick-select-btn {
              padding: var(--spacing-xs) var(--spacing-sm);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-md);
              background: var(--bg-primary);
              color: var(--text-secondary);
              font-size: var(--font-size-sm);
              cursor: pointer;
              transition: all var(--transition-fast);
              height: 32px;
              line-height: 1;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              
              &:hover {
                background: var(--bg-secondary);
                border-color: var(--border-color-hover);
              }
              
              &.active {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
              }
            }
          }
          
          .date-inputs {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            height: 32px;
            flex-shrink: 0;
            
            .date-input {
              flex: 1;
              height: 32px;
            }
            
            .separator {
              color: var(--text-secondary);
              font-size: var(--font-size-sm);
              padding: 0 var(--spacing-xs);
            }
          }
        }
        
        &.warehouse {
          width: 180px;
          margin-left: 0;
          
          .warehouse-select {
            height: 32px;
          }
        }
        
        &.search {
          width: 240px;
          
          .search-input {
            height: 32px;
          }
        }
        
        &.actions {
          margin-left: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          margin-top: 15px; // label height (20px) + margin-bottom (8px)
          
          .add-button {
            height: 40px;
            padding: 0 var(--spacing-md);
            font-size: var(--font-size-md);
            
            :deep(svg) {
              width: 20px;
              height: 20px;
              margin-right: var(--spacing-xs);
            }
          }
        }
      }
    }

    // 表格操作按鈕樣式 Table Action Buttons Styles
    .action-buttons {
      display: flex;
      gap: var(--spacing-xs);
      justify-content: center;

      .icon-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border: none;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          color: var(--color-primary);
          background: var(--bg-hover);
          border-radius: var(--radius-sm);
        }

        &.view-btn {
          color: var(--color-primary);
          
          &:hover {
            color: var(--color-primary-dark);
          }
        }

        &.approve-btn {
          color: var(--color-success);
          
          &:hover {
            color: var(--color-success-dark);
          }
        }

        &.reject-btn {
          color: var(--color-danger);
          
          &:hover {
            color: var(--color-danger-dark);
          }
        }

        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
}
</style> 