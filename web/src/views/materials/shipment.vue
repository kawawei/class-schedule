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
@import './shipment.scss';
</style> 