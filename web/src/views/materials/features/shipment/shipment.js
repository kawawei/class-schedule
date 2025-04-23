// 引入所需的函數和工具 Import required functions and utilities
import { ref, computed } from 'vue';
import Message from '@/utils/message';
import { 
  parseISO, 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  format 
} from 'date-fns';

// 出貨管理頁面邏輯 Shipment Management Page Logic
export const useShipmentManagement = () => {
  // 狀態定義 State definitions
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedWarehouse = ref('');
  const dateRange = ref({
    startDate: '',
    endDate: ''
  });
  
  // 模擬數據 Mock data
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

  // 倉庫選項 Warehouse options
  const warehouseOptions = ref([
    { label: '台北倉', value: 'taipei' },
    { label: '台中倉', value: 'taichung' },
    { label: '高雄倉', value: 'kaohsiung' }
  ]);

  // 表格列定義 Table columns definition
  const shipmentColumns = [
    { key: 'id', title: '出貨單號' },
    { key: 'warehouseName', title: '倉庫' },
    { key: 'totalAmount', title: '總金額' },
    { key: 'status', title: '狀態', slot: true },
    { key: 'createdAt', title: '創建時間' },
    { key: 'actions', title: '操作', slot: true }
  ];

  // 日期範圍選項 Date range options
  const dateOptions = [
    { label: '今天', value: 'today' },
    { label: '最近7天', value: 'last7days' },
    { label: '最近30天', value: 'last30days' },
    { label: '本月', value: 'thisMonth' }
  ];

  // 當前選中的日期範圍 Current selected date range
  const activeDateRange = ref('');

  // 過濾後的出貨單列表 Filtered shipment list
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

  // 方法定義 Methods definition
  
  // 檢查日期範圍是否被選中 Check if date range is active
  const isActiveDateRange = (value) => {
    return activeDateRange.value === value;
  };

  // 處理日期範圍選擇 Handle date range selection
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

  // 獲取狀態文字 Get status text
  const getStatusText = (status) => {
    const texts = {
      pending: '待審核',
      approved: '已審核',
      rejected: '已拒絕'
    };
    return texts[status] || status;
  };

  // 開啟新增出貨單對話框 Open add shipment dialog
  const openAddShipmentDialog = () => {
    Message.info('此功能開發中');
  };

  // 查看出貨單詳情 View shipment details
  const viewShipmentDetails = (shipment) => {
    Message.info('此功能開發中');
  };

  // 審核出貨單 Approve shipment
  const approveShipment = (shipment) => {
    Message.info('此功能開發中');
  };

  // 拒絕出貨單 Reject shipment
  const rejectShipment = (shipment) => {
    Message.info('此功能開發中');
  };

  // 應用過濾器 Apply filters
  const applyFilters = () => {
    // 過濾邏輯已經在 computed 屬性中實現
    // Filter logic is implemented in computed property
  };

  return {
    // 狀態 States
    loading,
    searchQuery,
    selectedWarehouse,
    dateRange,
    shipments,
    
    // 選項和配置 Options and configurations
    dateOptions,
    warehouseOptions,
    shipmentColumns,
    
    // 計算屬性 Computed properties
    filteredShipments,
    
    // 方法 Methods
    isActiveDateRange,
    handleDateRangeSelect,
    getStatusText,
    openAddShipmentDialog,
    viewShipmentDetails,
    approveShipment,
    rejectShipment,
    applyFilters
  };
}; 