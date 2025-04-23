import { ref, computed } from 'vue';
import { AppButton, AppInput, DataTable, AppDialog } from '@/components';

// 定義表格列配置 Define table column configuration
const columns = [
  {
    key: 'id',
    title: 'ID',
    width: 80
  },
  {
    key: 'name',
    title: '組合商品名稱',
    width: 200
  },
  {
    key: 'items',
    title: '包含商品',
    width: 300,
    render: (row) => row.items?.map(item => item.name).join(', ') || '-'
  },
  {
    key: 'total_price',
    title: '總價',
    width: 120,
    render: (row) => `$${row.total_price}`
  },
  {
    key: 'status',
    title: '狀態',
    width: 100,
    slot: 'status'
  },
  {
    key: 'created_at',
    title: '創建時間',
    width: 180,
    render: (row) => new Date(row.created_at).toLocaleString()
  },
  {
    key: 'actions',
    title: '操作',
    width: 120,
    slot: 'actions'
  }
];

// 組件設置 Component setup
export default {
  name: 'BundleManagement',
  components: {
    AppButton,
    AppInput,
    DataTable,
    AppDialog
  },
  setup() {
    // 數據狀態 Data state
    const loading = ref(false);
    const searchQuery = ref('');
    const bundleData = ref([]);
    const dialogVisible = ref(false);
    const deleteConfirmVisible = ref(false);
    const bundleToDelete = ref(null);
    const isEdit = ref(false);

    // 分頁配置 Pagination configuration
    const pagination = ref({
      current: 1,
      pageSize: 10,
      total: 0
    });

    // 過濾後的數據 Filtered data
    const filteredData = computed(() => {
      const query = searchQuery.value.toLowerCase();
      return bundleData.value.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.items?.some(subItem => subItem.name.toLowerCase().includes(query))
      );
    });

    // 獲取狀態文字 Get status text
    const getStatusText = (status) => {
      const statusMap = {
        active: '已啟用',
        inactive: '已停用',
        draft: '草稿'
      };
      return statusMap[status] || status;
    };

    // 打開添加對話框 Open add dialog
    const openAddDialog = () => {
      isEdit.value = false;
      dialogVisible.value = true;
    };

    // 打開編輯對話框 Open edit dialog
    const editBundle = (row) => {
      isEdit.value = true;
      // TODO: 設置表單數據 Set form data
      dialogVisible.value = true;
    };

    // 關閉對話框 Close dialog
    const closeDialog = () => {
      dialogVisible.value = false;
      // TODO: 重置表單數據 Reset form data
    };

    // 打開刪除確認 Open delete confirmation
    const deleteBundle = (row) => {
      bundleToDelete.value = row;
      deleteConfirmVisible.value = true;
    };

    // 關閉刪除確認 Close delete confirmation
    const closeDeleteConfirm = () => {
      deleteConfirmVisible.value = false;
      bundleToDelete.value = null;
    };

    // 確認刪除 Confirm deletion
    const confirmDelete = async () => {
      if (!bundleToDelete.value) return;
      
      try {
        loading.value = true;
        // TODO: 實現刪除邏輯 Implement deletion logic
        await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬 API 調用 Simulate API call
        closeDeleteConfirm();
      } catch (error) {
        console.error('刪除失敗:', error);
      } finally {
        loading.value = false;
      }
    };

    // 處理分頁變化 Handle page change
    const handlePageChange = (page) => {
      pagination.value.current = page;
      // TODO: 獲取對應頁面數據 Get corresponding page data
    };

    return {
      loading,
      searchQuery,
      columns,
      filteredData,
      pagination,
      dialogVisible,
      deleteConfirmVisible,
      isEdit,
      getStatusText,
      openAddDialog,
      editBundle,
      closeDialog,
      deleteBundle,
      closeDeleteConfirm,
      confirmDelete,
      handlePageChange
    };
  }
}; 