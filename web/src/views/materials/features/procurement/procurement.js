// 引入所需的函數和工具 Import required functions and utilities
import { ref, computed, onMounted } from 'vue';
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
import { useRouter } from 'vue-router';
import axios from 'axios'; // 新增：直接引入 axios

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
  const procurements = ref([]);  // 清空初始數據，確保響應性 Clear initial data to ensure reactivity

  // 供應商選項 Supplier options
  const supplierOptions = ref([
    { label: '金石堂', value: 'kingstone' },
    { label: '博客來', value: 'books' },
    { label: '誠品', value: 'eslite' }
  ]);

  // 表格列定義 Table columns definition
  const procurementColumns = [
    { key: 'procurementNo', title: '採購單號' },
    { key: 'supplier', title: '供應商' },
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

  // 提交採購單表單 Submit procurement form
  const submitProcurementForm = async () => {
    const formRef = document.querySelector('.procurement-form')?.__vueParentComponent?.ctx;
    if (formRef && typeof formRef.handleSubmit === 'function') {
      await formRef.handleSubmit();
    }
  };

  // 處理採購單提交 Handle procurement form submission
  const handleProcurementSubmit = async (formData) => {
    try {
      loading.value = true;
      // 將表單資料轉換為後端 API 格式 Convert form data to backend API format
      const payload = {
        procurementNo: formData.procurementNo, // 採購單號 Procurement Number
        procurementDate: formData.procurementDate, // 採購日期 Procurement Date
        supplier: formData.supplier, // 供應商 Supplier
        items: formData.items.map(item => ({ // 採購項目 Procurement Items
          name: item.materialId, // 物料名稱 Material Name
          quantity: item.specifications?.[0]?.quantity || 1, // 數量 Quantity
          unitPrice: item.specifications?.[0]?.unitPrice || 0 // 單價 Unit Price
        })),
        currency: formData.items[0]?.currency || 'TWD', // 幣別 Currency
        remark: formData.remark || '', // 備註 Remark
        extraCharges: formData.extraCharges || [] // 額外費用 Extra Charges
      };
      // 取得 JWT token Get JWT token
      const token = localStorage.getItem('token');
      // 呼叫後端 API 新增採購單 Call backend API to create procurement
      const res = await axios.post('/procurements', payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      });
      if (res.data && res.data.success) {
        Message.success('採購單已成功創建！ Procurement order created successfully!');
        procurements.value = [res.data.data, ...procurements.value]; // 新增到前端列表 Add to frontend list
        showProcurementDialog.value = false;
      } else {
        Message.error(res.data.message || '採購單創建失敗');
      }
    } catch (error) {
      Message.error('採購單創建失敗: ' + (error.response?.data?.message || error.message || error));
    } finally {
      loading.value = false;
    }
  };

  // 查看採購單詳情 View procurement details
  const viewProcurementDetails = (procurement) => {
    Message.info('此功能開發中');
  };

  // 審核採購單 Approve procurement
  const approveProcurement = async (procurement) => {
    try {
      // 更新採購單狀態 Update procurement status
      procurement.status = 'approved';
      
      // 在實際應用中，這裡應該調用後端 API
      // In real application, should call backend API here
      
      Message.success('採購單審核通過！');
    } catch (error) {
      console.error('Error approving procurement:', error);
      Message.error('審核失敗，請稍後重試！');
    }
  };

  // 進貨操作 Purchase operation
  const handlePurchase = (procurement) => {
    // 跳轉到進貨頁面並帶上採購單信息
    // Navigate to purchase page with procurement info
    router.push({
      name: 'purchase',
      query: { procurementId: procurement.id }
    });
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

  // 取得所有採購單 Fetch all procurements from backend
  const fetchProcurements = async () => {
    try {
      loading.value = true;
      const token = localStorage.getItem('token'); // 取得 JWT token
      const res = await axios.get('/procurements', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });
      if (res.data && res.data.success) {
        procurements.value = res.data.data; // 寫入前端狀態 Write to frontend state
      } else {
        procurements.value = [];
        Message.error(res.data.message || '獲取採購單失敗');
      }
    } catch (error) {
      procurements.value = [];
      Message.error('獲取採購單失敗: ' + (error.response?.data?.message || error.message || error));
    } finally {
      loading.value = false;
    }
  };

  // 掛載時自動取得採購單 On mounted, fetch procurements
  onMounted(() => {
    fetchProcurements();
  });

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
    submitProcurementForm,
    handleProcurementSubmit,
    viewProcurementDetails,
    approveProcurement,
    rejectProcurement,
    handlePurchase,
    applyFilters
  };
}; 