import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Message from '@/utils/message';
import { courseAPI, scheduleAPI } from '@/utils/api';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/api';
import inventoryFormLogic from '@/components/inventory/InventoryForm';

// 課程種類選項 Course type options
const courseTypeOptionsRef = ref([]);

// 獲取課程種類 Get course types
const fetchCourseTypes = async () => {
  try {
    // 調用課程API獲取課程列表 Call course API to get course list
    const response = await courseAPI.getAllCourses();
    
    if (response.success) {
      // 從課程列表中提取不重複的類別 Extract unique categories from course list
      const categories = [...new Set(response.data.map(course => {
        const courseData = course.dataValues || course;
        return courseData.category;
      }))];
      
      // 轉換為選項格式 Convert to options format
      courseTypeOptionsRef.value = categories.map(category => ({
        label: category,
        value: category
      }));
    } else {
      Message.error(response.message || '獲取課程種類失敗 Failed to get course types');
    }
  } catch (error) {
    console.error('獲取課程種類失敗 Failed to get course types:', error);
    Message.error('獲取課程種類失敗 Failed to get course types');
  }
};

// 倉庫位置選項 Warehouse location options
const locationOptions = ref([
  { label: '全部位置', value: '' }
]);

// 獲取倉庫列表 Get warehouse list
const fetchWarehouseList = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/warehouse`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const warehouses = await response.json();
    // 直接添加倉庫選項，不再添加"全部位置"選項 Add warehouse options directly without adding "All Locations" again
    locationOptions.value = [
      { label: '全部位置', value: '' },
      ...warehouses.map(warehouse => ({
        label: warehouse.name,
        value: warehouse.id.toString()
      }))
    ];
  } catch (error) {
    console.error('獲取倉庫列表失敗 Failed to fetch warehouse list:', error);
    // 如果獲取失敗，保持原有的"全部位置"選項 Keep the original "All Locations" option if fetch fails
    locationOptions.value = [{ label: '全部位置', value: '' }];
  }
};

// 貨幣選項 Currency options
const currencyOptions = [
  { label: 'NT$ 新台幣', value: 'NT$' },
  { label: '¥ 人民幣', value: '¥' }
];

// 獲取貨幣符號 Get currency symbol
const getCurrencySymbol = (currency) => {
  return currency || 'NT$';
};

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
    key: 'image',
    title: '圖片',
    width: 100,
    align: 'center',
    slot: true,
    render: (row) => {
      if (row.image_url) {
        return `<img src="${row.image_url}" class="inventory-thumbnail" alt="${row.name}" />`;
      }
      return '<div class="no-image">未上傳</div>';
    }
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
    render: (row) => {
      // 根據選擇的倉庫顯示數量
      if (selectedLocation.value) {
        const warehouse = row.warehouses?.find(w => w.location === selectedLocation.value);
        return warehouse?.quantity || 0;
      }
      // 顯示所有倉庫的總數量
      return row.warehouses ? row.warehouses.reduce((sum, w) => sum + (w.quantity || 0), 0) : 0;
    }
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
    align: 'center',
    render: (row) => {
      // 根據選擇的倉庫顯示不良品數量
      if (selectedLocation.value) {
        const warehouse = row.warehouses?.find(w => w.location === selectedLocation.value);
        return warehouse?.defectiveQuantity || 0;
      }
      // 顯示所有倉庫的總不良品數量
      return row.warehouses ? row.warehouses.reduce((sum, w) => sum + (w.defectiveQuantity || 0), 0) : 0;
    }
  },
  {
    key: 'unitPrice',
    title: '單價',
    width: 120,
    align: 'right',
    render: (row) => `${row.unitPriceCurrency} ${row.unitPrice}`
  },
  {
    key: 'cost',
    title: '成本',
    width: 120,
    align: 'right',
    render: (row) => `${row.costCurrency} ${row.cost}`
  },
  {
    key: 'qrcode',
    title: 'QR Code',
    width: 250,
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

// 獲取貨幣顯示文本（下拉選單用）Get currency display text (for dropdown)
const getCurrencyLabel = (option) => {
  return option.label;
};

// 獲取貨幣顯示文本（選中狀態用）Get currency display text (for selected state)
const getCurrencyDisplayText = (option) => {
  if (!option) return 'NT$';
  return option.symbol;
};

// 貨幣選擇器配置 Currency selector configuration
const currencySelectProps = {
  valueKey: 'value',
  labelKey: 'label',
  selectedLabelKey: 'symbol'
};

// 獲取倉庫名稱 Get warehouse name
const getWarehouseName = (locationId) => {
  const warehouse = locationOptions.value.find(option => option.value === locationId);
  return warehouse ? warehouse.label : `倉庫 ${locationId}`;
};

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
    
    // 貨物列表數據 Inventory list data
    const inventoryData = ref([]);
    
    // 對話框狀態 Dialog state
    const dialogVisible = ref(false);
    const deleteConfirmVisible = ref(false);
    const isEditing = ref(false);
    const itemToDelete = ref(null);
    
    // 表單邏輯和數據 Form logic and data
    const formLogic = inventoryFormLogic.createInventoryFormLogic();
    const form = formLogic.form;
    
    // 詳情對話框狀態 Details dialog state
    const detailsDialogVisible = ref(false);
    const selectedItem = ref(null);
    
    // 圖片預覽相關 Image preview related
    const imagePreviewVisible = ref(false);
    const previewImageUrl = ref('');
    
    // 篩選後的貨物列表 Filtered inventory list
    const filteredInventory = computed(() => {
      console.log('開始篩選貨物列表，當前篩選條件:', {
        selectedLocation: selectedLocation.value,
        selectedType: selectedType.value,
        searchQuery: searchQuery.value,
        minQuantity: minQuantity.value,
        maxQuantity: maxQuantity.value
      });
      
      let result = [...inventoryData.value];
      
      // 倉庫位置過濾 Location filter
      if (selectedLocation.value) {
        console.log('正在按倉庫位置篩選:', selectedLocation.value);
        result = result.filter(item => {
          // 檢查是否有選定倉庫的庫存
          const hasWarehouse = item.warehouses?.some(w => 
            w.location === selectedLocation.value && w.quantity > 0
          );
          console.log('檢查貨物在選定倉庫的狀態:', {
            itemName: item.name,
            warehouseId: selectedLocation.value,
            hasStock: hasWarehouse
          });

          if (hasWarehouse) {
            // 只保留選定倉庫的數據
            item.warehouses = item.warehouses.filter(w => w.location === selectedLocation.value);
          }
          
          return hasWarehouse;
        });
      }
      
      // 搜索過濾 Search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.courseType.toLowerCase().includes(query)
        );
      }
      
      // 課程種類過濾 Course type filter
      if (selectedType.value) {
        result = result.filter(item => item.courseType === selectedType.value);
      }
      
      // 數量範圍過濾 Quantity range filter
      if (minQuantity.value) {
        const min = Number(minQuantity.value);
        result = result.filter(item => {
          const quantity = selectedLocation.value
            ? item.warehouses[0]?.quantity || 0
            : getTotalQuantity(item.warehouses);
          return quantity >= min;
        });
      }
      
      if (maxQuantity.value) {
        const max = Number(maxQuantity.value);
        result = result.filter(item => {
          const quantity = selectedLocation.value
            ? item.warehouses[0]?.quantity || 0
            : getTotalQuantity(item.warehouses);
          return quantity <= max;
        });
      }
      
      console.log('篩選後的結果:', {
        totalItems: result.length,
        items: result
      });
      
      return result;
    });
    
    // 獲取庫存狀態 Get stock status
    const getStockStatus = (item) => {
      if (item.quantity <= 0) return 'error';
      if (item.quantity <= item.minQuantity) return 'warning';
      return 'primary';
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
    const openAddInventoryDialog = async () => {
      isEditing.value = false;
      form.value = inventoryFormLogic.resetForm();
      // 獲取倉庫列表 Get warehouse list
      await fetchWarehouseList();
      dialogVisible.value = true;
    };

    // 打開新增對話框 Open add dialog
    const openAddDialog = () => {
      dialogVisible.value = true;
    };
    
    // 打開編輯貨物對話框 Open edit inventory dialog
    const editInventory = async (item) => {
      try {
        // 獲取倉庫列表 Get warehouse list
        await fetchWarehouseList();
        
        // 獲取完整的貨物詳情 Get complete inventory details
        const response = await axios.get(`/inventory/${item.id}`);
        if (response.data && response.data.success) {
          const itemData = response.data.data;
          isEditing.value = true;
          
          // 重置表單並填充數據 Reset form and populate data
          form.value = {
            id: itemData.id,
            name: itemData.name,
            courseType: itemData.courseType,
            minQuantity: itemData.minQuantity,
            unitPrice: itemData.unitPrice,
            unitPriceCurrency: itemData.unitPriceCurrency,
            cost: itemData.cost,
            costCurrency: itemData.costCurrency,
            notes: itemData.notes,
            qrcode: itemData.qrcode_url ? {
              url: itemData.qrcode_url,
              name: itemData.qrcode_name
            } : null,
            warehouses: itemData.warehouses || [{
              location: '',
              quantity: 0,
              minQuantity: 0,
              defectiveQuantity: 0
            }]
          };
          
          dialogVisible.value = true;
        } else {
          throw new Error(response.data?.message || '獲取貨物詳情失敗');
        }
      } catch (error) {
        console.error('編輯貨物失敗:', error);
        Message.error(error.message || '編輯貨物失敗');
      }
    };
    
    // 關閉對話框 Close dialog
    const closeDialog = () => {
      dialogVisible.value = false;
      form.value = inventoryFormLogic.resetForm();
    };
    
    // 獲取貨物列表 Get inventory list
    const fetchInventoryList = async () => {
      try {
        loading.value = true;
        const response = await axios.get(`/inventory`);
        if (response.data && response.data.success) {
          // 確保數據是數組 Ensure data is an array
          inventoryData.value = Array.isArray(response.data.data) 
            ? response.data.data 
            : [];
          console.log('成功獲取貨物列表:', inventoryData.value);
        } else {
          console.error('獲取貨物列表失敗: 響應格式不正確', response.data);
          Message.error('獲取貨物列表失敗 Failed to get inventory list');
          inventoryData.value = []; // 確保設置為空數組 Ensure set to empty array
        }
      } catch (error) {
        console.error('獲取貨物列表失敗:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        Message.error('獲取貨物列表失敗 Failed to get inventory list');
        inventoryData.value = []; // 確保設置為空數組 Ensure set to empty array
      } finally {
        loading.value = false;
      }
    };

    // 提交表單 Submit form
    const submitForm = async () => {
      const success = await formLogic.submitForm();
      if (success) {
        await fetchInventoryList();
        dialogVisible.value = false;
        form.value = inventoryFormLogic.resetForm();
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
    const viewInventoryDetails = async (item) => {
      try {
        const response = await axios.get(`/inventory/${item.id}`);
        if (response.data && response.data.success) {
          selectedItem.value = response.data.data;
          detailsDialogVisible.value = true;
        } else {
          throw new Error(response.data?.message || '獲取詳情失敗');
        }
      } catch (error) {
        console.error('獲取詳情失敗:', error);
        Message.error(error.message || '獲取詳情失敗');
      }
    };
    
    // 刪除貨物 Delete inventory
    const deleteInventoryItem = async (id) => {
      try {
        const response = await axios.delete(`/inventory/${id}`);
        if (response.data && response.data.success) {
          Message.success('刪除成功 / Deletion successful');
          await fetchInventoryList();
        } else {
          throw new Error(response.data?.message || '刪除失敗');
        }
      } catch (error) {
        console.error('刪除失敗:', error);
        throw error;
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
    
    // 初始化空的庫存列表 Initialize empty inventory list
    const initInventoryList = () => {
      inventoryData.value = [];
    };
    
    // 在組件掛載時初始化數據 Initialize data when component is mounted
    onMounted(async () => {
      try {
        loading.value = true;
        // 獲取課程種類 Get course types
        await fetchCourseTypes();
        // 獲取倉庫列表 Get warehouse list
        await fetchWarehouseList();
        // 獲取庫存列表 Get inventory list
        await fetchInventoryList();
      } catch (error) {
        console.error('初始化數據失敗 Failed to initialize data:', error);
        Message.error('初始化數據失敗 Failed to initialize data');
      } finally {
        loading.value = false;
      }
    });

    // 計算總數量 Calculate total quantity
    const getTotalQuantity = (warehouses) => {
      if (!warehouses) return 0;
      return warehouses.reduce((total, warehouse) => total + (warehouse.quantity || 0), 0);
    };

    // 計算總不良品數量 Calculate total defective quantity
    const getTotalDefectiveQuantity = (warehouses) => {
      if (!warehouses) return 0;
      return warehouses.reduce((total, warehouse) => total + (warehouse.defectiveQuantity || 0), 0);
    };

    // 獲取指定倉庫的數量 Get quantity for specific warehouse
    const getWarehouseQuantity = (locationId, type = 'normal', warehouses) => {
      if (!warehouses) return 0;
      if (!locationId) {
        return type === 'normal' 
          ? getTotalQuantity(warehouses)
          : getTotalDefectiveQuantity(warehouses);
      }
      
      const warehouse = warehouses?.find(w => w.location === locationId);
      return type === 'normal' 
        ? (warehouse?.quantity || 0)
        : (warehouse?.defectiveQuantity || 0);
    };

    // 關閉詳情對話框 Close details dialog
    const closeDetailsDialog = () => {
      detailsDialogVisible.value = false;
      selectedItem.value = null;
    };

    // 預覽圖片 Preview image
    const previewImage = (imageUrl) => {
      if (!imageUrl) return;
      previewImageUrl.value = imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}/uploads/${row.company_code}/materials/${imageUrl}`;
      showPreview.value = true;
    };
    
    // 關閉圖片預覽 Close image preview
    const closeImagePreview = () => {
      imagePreviewVisible.value = false;
      previewImageUrl.value = '';
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
      detailsDialogVisible,
      selectedItem,
      imagePreviewVisible,
      previewImageUrl,
      
      // 選項 Options
      courseTypeOptionsRef,
      locationOptions,
      inventoryColumns,
      qrcodeColumns,
      API_BASE_URL,
      currencyOptions,
      getCurrencySymbol,
      getCurrencyLabel,
      getCurrencyDisplayText,
      currencySelectProps,
      
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
      fetchInventoryList,
      getTotalQuantity,
      getTotalDefectiveQuantity,
      closeDetailsDialog,
      previewImage,
      closeImagePreview,
      getWarehouseName,
      getWarehouseQuantity
    };
  }
};

