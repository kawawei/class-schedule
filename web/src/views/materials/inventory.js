import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import Message from '@/utils/message';
import { courseAPI } from '@/utils/api';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/api';

// 課程種類選項 Course type options
const courseTypeOptions = [
  { value: '鋼琴', label: '鋼琴' },
  { value: '小提琴', label: '小提琴' },
  { value: '吉他', label: '吉他' },
  { value: '長笛', label: '長笛' },
  { value: '聲樂', label: '聲樂' },
  { value: '繪畫', label: '繪畫' },
  { value: '書法', label: '書法' },
  { value: '舞蹈', label: '舞蹈' }
];

// 倉庫位置選項 Warehouse location options
const locationOptions = [
  { label: '全部位置', value: '' },
  { label: '倉庫A', value: 'A' },
  { label: '倉庫B', value: 'B' },
  { label: '倉庫C', value: 'C' }
];

// 表格列定義 Table column definitions
const inventoryColumns = [
  {
    key: 'index',
    title: '序號',
    width: 80,
    align: 'center',
    slot: true
  },
  {
    key: 'name',
    title: '貨物名稱',
    width: 250,
  },
  {
    key: 'courseType',
    title: '課程種類',
    width: 180
  },
  {
    key: 'quantity',
    title: '當前數量',
    width: 120,
    align: 'center',
    slot: true
  },
  {
    key: 'minQuantity',
    title: '最小庫存量',
    width: 120,
    align: 'center'
  },
  {
    key: 'defectiveQuantity',
    title: '不良品數量',
    width: 120,
    align: 'center'
  },
  {
    key: 'location',
    title: '倉庫位置',
    width: 120,
    align: 'center'
  },
  {
    key: 'unitPrice',
    title: '單價',
    width: 120,
    align: 'right'
  },
  {
    key: 'cost',
    title: '成本',
    width: 120,
    align: 'right'
  },
  {
    key: 'qrcode',
    title: 'QR Code',
    width: 250,
    slot: true
  },
  {
    key: 'status',
    title: '狀態',
    width: 120,
    align: 'center',
    slot: true
  },
  {
    key: 'actions',
    title: '操作',
    width: 150,
    align: 'center',
    slot: true,
    fixed: 'right'
  }
];

// QR Code 表格列定義 QR Code table column definitions
const qrcodeColumns = [
  {
    key: 'qrcode_url',
    title: 'QR Code',
    width: 100,
    align: 'center',
    slot: true
  },
  {
    key: 'name',
    title: '名稱',
    width: 200
  },
  {
    key: 'scan_count',
    title: '掃描次數',
    width: 100,
    align: 'center'
  },
  {
    key: 'actual_url',
    title: '目標連結',
    width: 300
  }
];

export default {
  name: 'InventoryLogic',
  setup() {
    const router = useRouter();
    
    // 用戶信息 User information
    const userName = ref(JSON.parse(localStorage.getItem('user'))?.name || '管理員');
    const isLoggingOut = ref(false);
    
    // 加載狀態 Loading state
    const loading = ref(false);
    
    // 搜索查詢 Search query
    const searchQuery = ref('');
    
    // 篩選條件 Filter conditions
    const filters = reactive({
      courseType: '',
      location: '',
      minQuantity: '',
      maxQuantity: ''
    });

    // 篩選相關的響應式變量 Filter related reactive variables
    const selectedType = ref('');  // 選中的課程類型
    const selectedLocation = ref(''); // 選中的倉庫位置
    const minQuantity = ref(''); // 最小數量
    const maxQuantity = ref(''); // 最大數量
    
    // 課程類型選項 Course type options
    const courseTypeOptionsRef = ref([]);
    
    // 貨物列表數據 Inventory list data
    const inventoryData = ref([]);
    
    // 對話框狀態 Dialog state
    const dialogVisible = ref(false);
    const deleteConfirmVisible = ref(false);
    const isEditing = ref(false);
    const itemToDelete = ref(null);
    
    // 表單數據 Form data
    const form = ref({
      id: null,
      name: '',
      courseType: '',
      quantity: '',
      minQuantity: '',
      defectiveQuantity: '',
      location: '',
      unitPrice: '',
      cost: '',
      notes: '',
      qrcode: null
    });

    // QR Code 選擇相關的狀態 QR Code selection related states
    const qrcodeSelectVisible = ref(false);
    const qrcodeList = ref([]);
    const qrcodeLoading = ref(false);
    const selectedQRCode = ref(null);
    
    // 篩選後的貨物列表 Filtered inventory list
    const filteredInventory = computed(() => {
      let result = [...inventoryData.value];
      
      // 搜索過濾 Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.courseType.toLowerCase().includes(query)
        );
      }
      
      // 課程種類過濾 Course type filter
      if (filters.courseType) {
        result = result.filter(item => item.courseType === filters.courseType);
      }
      
      // 倉庫位置過濾 Location filter
      if (filters.location) {
        result = result.filter(item => item.location === filters.location);
      }
      
      // 數量範圍過濾 Quantity range filter
      if (filters.minQuantity) {
        result = result.filter(item => item.quantity >= Number(filters.minQuantity));
      }
      if (filters.maxQuantity) {
        result = result.filter(item => item.quantity <= Number(filters.maxQuantity));
      }
      
      return result;
    });
    
    // 獲取庫存狀態 Get stock status
    const getStockStatus = (item) => {
      if (item.quantity <= 0) return 'danger';
      if (item.quantity <= item.minQuantity) return 'warning';
      return 'success';
    };
    
    // 獲取庫存狀態文字 Get stock status text
    const getStockStatusText = (item) => {
      if (item.quantity <= 0) return '無庫存';
      if (item.quantity <= item.minQuantity) return '低庫存';
      return '正常';
    };
    
    // 處理搜索 Handle search
    const handleSearch = () => {
      // 搜索邏輯已通過計算屬性實現 Search logic is implemented through computed property
    };
    
    // 應用篩選 Apply filters
    const applyFilters = () => {
      // 篩選邏輯已通過計算屬性實現 Filter logic is implemented through computed property
    };
    
    // 打開新增貨物對話框 Open add inventory dialog
    const openAddInventoryDialog = () => {
      isEditing.value = false;
      resetForm();
      dialogVisible.value = true;
    };

    // 打開新增對話框 Open add dialog
    const openAddDialog = () => {
      dialogVisible.value = true;
    };
    
    // 打開編輯貨物對話框 Open edit inventory dialog
    const editInventory = (item) => {
      isEditing.value = true;
      Object.assign(form.value, item);
      dialogVisible.value = true;
    };
    
    // 關閉對話框 Close dialog
    const closeDialog = () => {
      dialogVisible.value = false;
      resetForm();
    };
    
    // 重置表單 Reset form
    const resetForm = () => {
      form.value = {
        id: null,
        name: '',
        courseType: '',
        quantity: '',
        minQuantity: '',
        defectiveQuantity: '',
        location: '',
        unitPrice: '',
        cost: '',
        notes: '',
        qrcode: null
      };
    };
    
    // 提交表單 Submit form
    const submitForm = async () => {
      try {
        loading.value = true;
        // TODO: 實現與後端的交互 Implement backend interaction
        const result = isEditing.value
          ? await updateInventory(form.value)
          : await createInventory(form.value);
        
        Message.success(isEditing.value ? '更新成功' : '創建成功');
        dialogVisible.value = false;
        await fetchInventoryList();
      } catch (error) {
        console.error('提交表單失敗:', error);
        Message.error(error.message || '操作失敗');
      } finally {
        loading.value = false;
      }
    };
    
    // 打開刪除確認對話框 Open delete confirmation dialog
    const deleteInventory = (item) => {
      itemToDelete.value = item;
      deleteConfirmVisible.value = true;
    };
    
    // 關閉刪除確認對話框 Close delete confirmation dialog
    const closeDeleteConfirm = () => {
      deleteConfirmVisible.value = false;
      itemToDelete.value = null;
    };
    
    // 確認刪除 Confirm delete
    const confirmDelete = async () => {
      if (!itemToDelete.value) return;
      
      try {
        loading.value = true;
        // TODO: 實現與後端的交互 Implement backend interaction
        await deleteInventoryItem(itemToDelete.value.id);
        
        Message.success('刪除成功');
        deleteConfirmVisible.value = false;
        itemToDelete.value = null;
        await fetchInventoryList();
      } catch (error) {
        console.error('刪除失敗:', error);
        Message.error(error.message || '刪除失敗');
      } finally {
        loading.value = false;
      }
    };
    
    // 查看貨物詳情 View inventory details
    const viewInventoryDetails = (item) => {
      // TODO: 實現查看詳情功能 Implement view details function
    };
    
    // 獲取貨物列表 Get inventory list
    const fetchInventoryList = async () => {
      try {
        loading.value = true;
        // TODO: 實現與後端的交互 Implement backend interaction
        // const response = await getInventoryList();
        // inventoryData.value = response.data;
      } catch (error) {
        console.error('獲取貨物列表失敗:', error);
        Message.error(error.message || '獲取貨物列表失敗');
      } finally {
        loading.value = false;
      }
    };

    // 獲取課程類型 Get course types
    const fetchCourseTypes = async () => {
      try {
        const response = await courseAPI.getAllCourses();
        if (response.data) {
          const categories = [...new Set(response.data.map(courseData => {
            return courseData.category;
          }))];
          
          courseTypeOptionsRef.value = [
            { label: '全部種類', value: '' },
            ...categories.map(category => ({
              label: category,
              value: category
            }))
          ];
        }
      } catch (error) {
        console.error('獲取課程種類失敗:', error);
      }
    };

    // QR Code 相關功能 QR Code related functions
    const openQRCodeSelect = async () => {
      await fetchQRCodes();
      qrcodeSelectVisible.value = true;
    };

    const selectQRCode = (qrcode) => {
      selectedQRCode.value = qrcode;
    };

    const confirmQRCodeSelect = () => {
      if (selectedQRCode.value) {
        form.value.qrcode = {
          url: selectedQRCode.value.qrcode_url,
          name: selectedQRCode.value.name
        };
      }
      closeQRCodeSelect();
    };

    const closeQRCodeSelect = () => {
      qrcodeSelectVisible.value = false;
      selectedQRCode.value = null;
    };

    const fetchQRCodes = async () => {
      try {
        qrcodeLoading.value = true;
        const response = await axios.get('/qrcode');
        if (response.data && response.data.success) {
          qrcodeList.value = response.data.data;
        } else {
          console.error('獲取 QR Code 列表失敗: 響應格式不正確', response.data);
        }
      } catch (error) {
        console.error('獲取 QR Code 列表失敗:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
      } finally {
        qrcodeLoading.value = false;
      }
    };
    
    // 處理登出 Handle logout
    const handleLogout = async () => {
      try {
        isLoggingOut.value = true;
        // TODO: 實現登出邏輯 Implement logout logic
        await router.push('/login');
      } catch (error) {
        console.error('登出失敗:', error);
        Message.error(error.message || '登出失敗');
      } finally {
        isLoggingOut.value = false;
      }
    };
    
    return {
      // 狀態 State
      userName,
      isLoggingOut,
      loading,
      searchQuery,
      filters,
      selectedType,
      selectedLocation,
      minQuantity,
      maxQuantity,
      courseTypeOptionsRef,
      inventoryData,
      filteredInventory,
      dialogVisible,
      deleteConfirmVisible,
      isEditing,
      itemToDelete,
      form,
      qrcodeSelectVisible,
      qrcodeList,
      qrcodeLoading,
      selectedQRCode,
      
      // 選項 Options
      courseTypeOptions,
      locationOptions,
      inventoryColumns,
      qrcodeColumns,
      API_BASE_URL,
      
      // 方法 Methods
      handleSearch,
      applyFilters,
      openAddInventoryDialog,
      openAddDialog,
      editInventory,
      closeDialog,
      submitForm,
      deleteInventory,
      closeDeleteConfirm,
      confirmDelete,
      viewInventoryDetails,
      handleLogout,
      getStockStatus,
      getStockStatusText,
      fetchCourseTypes,
      openQRCodeSelect,
      selectQRCode,
      confirmQRCodeSelect,
      closeQRCodeSelect,
      fetchQRCodes
    };
  }
}; 