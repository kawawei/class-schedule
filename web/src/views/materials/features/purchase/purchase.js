// 進貨管理頁面邏輯 Purchase Management Page Logic
import { ref, reactive, computed, onMounted } from 'vue';
import Message from '@/utils/message';
import { API_BASE_URL } from '@/utils/api';

export default function usePurchase() {
  // 狀態管理 State Management
  const loading = ref(false);
  const dialogVisible = ref(false);
  const detailsDialogVisible = ref(false);
  const isEditing = ref(false);
  const searchQuery = ref('');
  const dateRange = ref([]);
  const selectedSupplier = ref('');

  // 表單數據 Form Data
  const form = reactive({
    id: null,
    supplierId: '',
    items: [],
    totalAmount: 0,
    notes: '',
    status: 'pending'
  });

  // 選中的進貨單 Selected Purchase Order
  const selectedPurchase = ref(null);

  // 供應商選項 Supplier Options
  const supplierOptions = ref([]);

  // 進貨單列表 Purchase Orders List
  const purchases = ref([]);

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
    // 確保 purchases.value 是數組 Ensure purchases.value is an array
    const purchaseList = Array.isArray(purchases.value) ? purchases.value : [];
    let result = [...purchaseList];

    // 搜尋過濾 Search Filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(purchase => 
        purchase.id.toLowerCase().includes(query) ||
        purchase.supplierName.toLowerCase().includes(query)
      );
    }

    // 日期範圍過濾 Date Range Filter
    if (dateRange.value && dateRange.value.length === 2) {
      const startDate = new Date(dateRange.value[0]);
      const endDate = new Date(dateRange.value[1]);
      result = result.filter(purchase => {
        const purchaseDate = new Date(purchase.createdAt);
        return purchaseDate >= startDate && purchaseDate <= endDate;
      });
    }

    // 供應商過濾 Supplier Filter
    if (selectedSupplier.value) {
      result = result.filter(purchase => 
        purchase.supplierId === selectedSupplier.value
      );
    }

    return result;
  });

  // 應用過濾器 Apply filters
  const applyFilters = () => {
    // 過濾邏輯已經在 computed 中實現
    // Filter logic is already implemented in computed
  };

  // 方法 Methods
  const fetchPurchases = async () => {
    try {
      loading.value = true;
      const response = await fetch(`${API_BASE_URL}/purchases`);
      const data = await response.json();
      purchases.value = data;
    } catch (error) {
      Message.error('獲取進貨單列表失敗');
    } finally {
      loading.value = false;
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/suppliers`);
      const data = await response.json();
      supplierOptions.value = data.map(supplier => ({
        label: supplier.name,
        value: supplier.id
      }));
    } catch (error) {
      Message.error('獲取供應商列表失敗');
    }
  };

  const openAddPurchaseDialog = () => {
    isEditing.value = false;
    form.id = null;
    form.supplierId = '';
    form.items = [];
    form.totalAmount = 0;
    form.notes = '';
    form.status = 'pending';
    dialogVisible.value = true;
  };

  const closeDialog = () => {
    dialogVisible.value = false;
  };

  const submitForm = async () => {
    try {
      loading.value = true;
      const response = await fetch(`${API_BASE_URL}/purchases`, {
        method: isEditing.value ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        Message.success(isEditing.value ? '更新成功' : '創建成功');
        await fetchPurchases();
        closeDialog();
      } else {
        throw new Error('操作失敗');
      }
    } catch (error) {
      Message.error(error.message || '操作失敗');
    } finally {
      loading.value = false;
    }
  };

  const viewPurchaseDetails = (purchase) => {
    selectedPurchase.value = purchase;
    detailsDialogVisible.value = true;
  };

  const closeDetailsDialog = () => {
    detailsDialogVisible.value = false;
    selectedPurchase.value = null;
  };

  const approvePurchase = async (purchase) => {
    try {
      loading.value = true;
      const response = await fetch(`${API_BASE_URL}/purchases/${purchase.id}/approve`, {
        method: 'POST'
      });

      if (response.ok) {
        Message.success('審核成功');
        await fetchPurchases();
      } else {
        throw new Error('審核失敗');
      }
    } catch (error) {
      Message.error(error.message || '審核失敗');
    } finally {
      loading.value = false;
    }
  };

  const rejectPurchase = async (purchase) => {
    try {
      loading.value = true;
      const response = await fetch(`${API_BASE_URL}/purchases/${purchase.id}/reject`, {
        method: 'POST'
      });

      if (response.ok) {
        Message.success('拒絕成功');
        await fetchPurchases();
      } else {
        throw new Error('拒絕失敗');
      }
    } catch (error) {
      Message.error(error.message || '拒絕失敗');
    } finally {
      loading.value = false;
    }
  };

  const getStatusType = (status) => {
    const types = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return types[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: '待審核',
      approved: '已審核',
      rejected: '已拒絕'
    };
    return texts[status] || status;
  };

  // 初始化 Initialization
  onMounted(() => {
    fetchPurchases();
    fetchSuppliers();
  });

  return {
    loading,
    dialogVisible,
    detailsDialogVisible,
    isEditing,
    searchQuery,
    dateRange,
    selectedSupplier,
    form,
    selectedPurchase,
    supplierOptions,
    purchases,
    filteredPurchases,
    purchaseColumns,
    openAddPurchaseDialog,
    closeDialog,
    submitForm,
    viewPurchaseDetails,
    closeDetailsDialog,
    approvePurchase,
    rejectPurchase,
    getStatusType,
    getStatusText,
    applyFilters
  };
} 