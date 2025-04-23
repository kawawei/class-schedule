import { ref, computed } from 'vue';
import Message from '@/utils/message';
import axios from 'axios';
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

// 創建盤點管理邏輯 Create stocktaking management logic
export default function useStocktakingManagement() {
  // 數據加載狀態 Data loading state
  const loading = ref(false);
  const deleting = ref(false);

  // 刪除相關狀態 Delete related states
  const deleteDialogVisible = ref(false);
  const currentItem = ref(null);

  // 搜索和過濾相關狀態 Search and filter related states
  const searchQuery = ref('');
  const dateRange = ref(['', '']);
  const stocktakingList = ref([]);
  const activeDateRange = ref(''); // 當前選中的日期範圍 Current selected date range

  // 分頁相關狀態 Pagination related states
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // 表格列配置 Table column configuration
  const columns = [
    {
      title: '盤點編號',
      key: 'id',
      width: 100
    },
    {
      title: '盤點日期',
      key: 'stocktaking_date',
      width: 150
    },
    {
      title: '倉庫',
      key: 'warehouse',
      width: 150
    },
    {
      title: '盤點人員',
      key: 'staff',
      width: 150
    },
    {
      title: '狀態',
      key: 'status',
      width: 120,
      slot: 'status'
    },
    {
      title: '備註',
      key: 'notes',
      width: 200
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      slot: 'actions'
    }
  ];

  // 過濾後的數據 Filtered data
  const filteredData = computed(() => {
    let result = [...stocktakingList.value];

    // 搜索過濾 Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(item => 
        item.id.toString().includes(query) ||
        item.warehouse.toLowerCase().includes(query) ||
        item.staff.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query))
      );
    }

    // 日期範圍過濾 Date range filter
    if (dateRange.value[0] && dateRange.value[1]) {
      const [start, end] = dateRange.value;
      result = result.filter(item => {
        const date = new Date(item.stocktaking_date);
        return date >= new Date(start) && date <= new Date(end);
      });
    }

    return result;
  });

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
        dateRange.value = [
          format(startOfToday, 'yyyy-MM-dd'),
          format(endOfDay(today), 'yyyy-MM-dd')
        ];
        break;
      case 'last7days':
        dateRange.value = [
          format(addDays(startOfToday, -6), 'yyyy-MM-dd'),
          format(today, 'yyyy-MM-dd')
        ];
        break;
      case 'last30days':
        dateRange.value = [
          format(addDays(startOfToday, -29), 'yyyy-MM-dd'),
          format(today, 'yyyy-MM-dd')
        ];
        break;
      case 'thisMonth':
        dateRange.value = [
          format(startOfMonth(today), 'yyyy-MM-dd'),
          format(endOfMonth(today), 'yyyy-MM-dd')
        ];
        break;
    }
  };

  // 獲取狀態文本 Get status text
  const getStatusText = (status) => {
    const statusMap = {
      draft: '草稿',
      in_progress: '進行中',
      completed: '已完成',
      cancelled: '已取消'
    };
    return statusMap[status] || status;
  };

  // 獲取盤點列表 Get stocktaking list
  const fetchStocktakingList = async () => {
    try {
      loading.value = true;
      const response = await axios.get('stocktaking', {
        params: {
          page: pagination.value.current,
          pageSize: pagination.value.pageSize
        }
      });

      if (response.data && response.data.success) {
        stocktakingList.value = response.data.data.items;
        pagination.value.total = response.data.data.total;
      } else {
        throw new Error(response.data?.message || '獲取盤點列表失敗');
      }
    } catch (error) {
      console.error('獲取盤點列表失敗:', error);
      Message.error(error.message || '獲取盤點列表失敗');
    } finally {
      loading.value = false;
    }
  };

  // 處理分頁變化 Handle pagination change
  const handlePageChange = (page) => {
    pagination.value.current = page;
    fetchStocktakingList();
  };

  // 處理刪除 Handle delete
  const handleDelete = (row) => {
    currentItem.value = row;
    deleteDialogVisible.value = true;
  };

  // 確認刪除 Confirm delete
  const confirmDelete = async () => {
    if (!currentItem.value?.id) return;

    try {
      deleting.value = true;
      const response = await axios.delete(`stocktaking/${currentItem.value.id}`);

      if (response.data && response.data.success) {
        Message.success('刪除成功');
        deleteDialogVisible.value = false;
        await fetchStocktakingList();
      } else {
        throw new Error(response.data?.message || '刪除失敗');
      }
    } catch (error) {
      console.error('刪除失敗:', error);
      Message.error(error.message || '刪除失敗');
    } finally {
      deleting.value = false;
    }
  };

  // 初始化 Initialize
  fetchStocktakingList();

  return {
    // 狀態 States
    loading,
    deleting,
    deleteDialogVisible,
    searchQuery,
    dateRange,
    activeDateRange,
    pagination,
    columns,
    filteredData,

    // 方法 Methods
    getStatusText,
    handlePageChange,
    handleDelete,
    confirmDelete,
    isActiveDateRange,
    handleDateRangeSelect
  };
} 