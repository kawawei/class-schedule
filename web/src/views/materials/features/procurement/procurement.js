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

// 採購管理頁面邏輯 Procurement Management Page Logic
export const useProcurementManagement = () => {
  // 狀態定義 State definitions
  const loading = ref(false);
  const searchQuery = ref('');
  const selectedSupplier = ref('');
  const dateRange = ref({
    startDate: '',
    endDate: ''
  });
  
  // 模擬數據 Mock data
  const procurements = ref([
    {
      id: 'PR001',
      supplierName: '金石堂',
      totalAmount: 5000,
      status: 'pending',
      createdAt: '2024-03-20'
    },
    {
      id: 'PR002',
      supplierName: '博客來',
      totalAmount: 8000,
      status: 'approved',
      createdAt: '2024-03-19'
    }
  ]);

  // 供應商選項 Supplier options
  const supplierOptions = ref([
    { label: '金石堂', value: 'kingstone' },
    { label: '博客來', value: 'books' },
    { label: '誠品', value: 'eslite' }
  ]);

  // 表格列定義 Table columns definition
  const procurementColumns = [
    { key: 'id', title: '採購單號' },
    { key: 'supplierName', title: '供應商' },
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

  // 對話框顯示控制 Dialog visibility control
  const showProcurementDialog = ref(false);
  const dialogType = ref('add'); // 'add' or 'edit'
  const currentProcurement = ref(null);

  // 過濾後的採購單列表 Filtered procurement list
  const filteredProcurements = computed(() => {
    return procurements.value.filter(procurement => {
      // 日期範圍過濾 Date range filter
      if (dateRange.value.startDate && dateRange.value.endDate) {
        const procurementDate = parseISO(procurement.createdAt);
        const start = parseISO(dateRange.value.startDate);
        const end = parseISO(dateRange.value.endDate);
        if (!isWithinInterval(procurementDate, { start, end })) {
          return false;
        }
      }

      // 供應商過濾 Supplier filter
      if (selectedSupplier.value && procurement.supplierName !== selectedSupplier.value) {
        return false;
      }

      // 搜尋過濾 Search filter
      if (searchQuery.value) {
        const searchLower = searchQuery.value.toLowerCase();
        return (
          procurement.id.toLowerCase().includes(searchLower) ||
          procurement.supplierName.toLowerCase().includes(searchLower)
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

  // 開啟新增採購單對話框 Open add procurement dialog
  const openAddProcurementDialog = () => {
    dialogType.value = 'add';
    currentProcurement.value = null;
    showProcurementDialog.value = true;
  };

  // 關閉採購單對話框 Close procurement dialog
  const closeProcurementDialog = () => {
    showProcurementDialog.value = false;
    currentProcurement.value = null;
  };

  // 處理採購單提交 Handle procurement form submission
  const handleProcurementSubmit = async (formData) => {
    try {
      loading.value = true;
      // TODO: 實現採購單提交邏輯
      console.log('提交的採購單數據：', formData);
      Message.success('採購單提交成功');
      closeProcurementDialog();
    } catch (error) {
      Message.error('採購單提交失敗');
    } finally {
      loading.value = false;
    }
  };

  // 查看採購單詳情 View procurement details
  const viewProcurementDetails = (procurement) => {
    Message.info('此功能開發中');
  };

  // 審核採購單 Approve procurement
  const approveProcurement = (procurement) => {
    Message.info('此功能開發中');
  };

  // 拒絕採購單 Reject procurement
  const rejectProcurement = (procurement) => {
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
    selectedSupplier,
    dateRange,
    procurements,
    
    // 選項和配置 Options and configurations
    dateOptions,
    supplierOptions,
    procurementColumns,
    
    // 計算屬性 Computed properties
    filteredProcurements,
    
    // 方法 Methods
    isActiveDateRange,
    handleDateRangeSelect,
    getStatusText,
    showProcurementDialog,
    dialogType,
    currentProcurement,
    openAddProcurementDialog,
    closeProcurementDialog,
    handleProcurementSubmit,
    viewProcurementDetails,
    approveProcurement,
    rejectProcurement,
    applyFilters
  };
}; 