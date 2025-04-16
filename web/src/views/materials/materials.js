import { ref, h, reactive, onMounted, watch } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppInput from '@/components/base/AppInput.vue';
import axios from 'axios';

// 配置 axios 基礎 URL Configure axios base URL
axios.defaults.baseURL = 'http://localhost:3006';

// 配置 axios 請求攔截器 Configure axios request interceptor
axios.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // 添加認證頭 Add authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 格式化日期函數 Format date function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
};

// 標籤頁圖標組件 Tab Icon Components
const MaterialIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('path', { d: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20' }),
      h('path', { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z' })
    ]);
  }
};

const QRCodeIcon = {
  render() {
    return h('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      width: 20,
      height: 20,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 2,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round'
    }, [
      h('rect', { x: 3, y: 3, width: 7, height: 7 }),
      h('rect', { x: 14, y: 3, width: 7, height: 7 }),
      h('rect', { x: 14, y: 14, width: 7, height: 7 }),
      h('rect', { x: 3, y: 14, width: 7, height: 7 })
    ]);
  }
};

// 定義標籤頁配置 Define tab configurations
const tabs = [
  {
    key: 'materials',
    label: '教材管理',
    icon: MaterialIcon,
    iconBg: 'rgba(0, 122, 255, 0.1)'
  },
  {
    key: 'qrcode',
    label: 'QRCode管理',
    icon: QRCodeIcon,
    iconBg: 'rgba(88, 86, 214, 0.1)'
  }
];

export default {
  name: 'MaterialsPage',
  components: {
    AppHeader,
    AppButton,
    DataTable,
    AppDialog,
    AppInput,
    MaterialIcon,
    QRCodeIcon
  },
  setup() {
    // 用戶信息 User information
    const userName = ref(JSON.parse(localStorage.getItem('user'))?.name || '管理員');
    const isLoggingOut = ref(false);
    
    // 當前標籤頁 Current tab
    const currentTab = ref('materials');
    
    // 加載狀態 Loading state
    const loading = ref(false);
    
    // QRCode列表數據 QRCode list data
    const qrcodeData = ref([]);

    // QRCode表格列定義 QRCode table column definitions
    const qrcodeColumns = [
      {
        key: 'id',
        title: 'ID',
        width: 80,
        align: 'center'
      },
      {
        key: 'qrcode_url',
        title: 'QRCode',
        width: 100,
        render: (row) => `<img src="${row.qrcode_url}" alt="QRCode" style="width: 50px; height: 50px;">`
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
      },
      {
        key: 'created_at',
        title: '創建時間',
        width: 160,
        render: (row) => formatDate(row.created_at)
      },
      {
        key: 'actions',
        title: '操作',
        width: 120,
        align: 'center'
      }
    ];
    
    // 切換標籤頁 Switch tab
    const switchTab = (tab) => {
      currentTab.value = tab;
      if (tab === 'qrcode') {
        fetchQRCodes();
      }
    };
    
    // 打開添加教材對話框 Open add material dialog
    const openAddMaterialDialog = () => {
      // 將在後續開發實現 Will be implemented later
    };
    
    // QRCode對話框相關 QRCode dialog related
    const qrcodeDialogVisible = ref(false);
    const qrcodeForm = ref({
      name: '',
      target_url: '',
      error: ''
    });
    
    // 獲取 QR Code 列表 Get QR Code list
    const fetchQRCodes = async () => {
      try {
        loading.value = true;
        const response = await axios.get('/api/qrcode');
        qrcodeData.value = response.data.data;
      } catch (error) {
        console.error('獲取 QR Code 列表失敗 Failed to fetch QR Code list:', error);
        qrcodeForm.value.error = error.response?.data?.message || '獲取 QR Code 列表失敗 Failed to fetch QR Code list';
      } finally {
        loading.value = false;
      }
    };
    
    // 打開QRCode對話框 Open QRCode dialog
    const openQRCodeDialog = () => {
      qrcodeDialogVisible.value = true;
      qrcodeForm.value = {
        name: '',
        target_url: '',
        error: ''
      };
    };
    
    // 關閉QRCode對話框 Close QRCode dialog
    const closeQRCodeDialog = () => {
      qrcodeDialogVisible.value = false;
      qrcodeForm.value = {
        name: '',
        target_url: '',
        error: ''
      };
    };
    
    // 提交QRCode表單 Submit QRCode form
    const submitQRCodeForm = async () => {
      try {
        loading.value = true;
        qrcodeForm.value.error = '';
        
        if (!qrcodeForm.value.name || !qrcodeForm.value.target_url) {
          qrcodeForm.value.error = '請填寫所有必填欄位 Please fill in all required fields';
          return;
        }

        const response = await axios.post('/api/qrcode', {
          name: qrcodeForm.value.name,
          target_url: qrcodeForm.value.target_url
        });

        await fetchQRCodes();
        
        closeQRCodeDialog();
      } catch (error) {
        console.error('創建 QR Code 失敗 Failed to create QR Code:', error);
        qrcodeForm.value.error = error.response?.data?.message || '創建 QR Code 失敗 Failed to create QR Code';
      } finally {
        loading.value = false;
      }
    };
    
    // 編輯 QR Code Edit QR Code
    const editQRCode = async (row) => {
      try {
        loading.value = true;
        qrcodeForm.value = {
          name: row.name,
          target_url: row.target_url,
          error: ''
        };
        qrcodeDialogVisible.value = true;
      } catch (error) {
        console.error('編輯 QR Code 失敗 Failed to edit QR Code:', error);
        qrcodeForm.value.error = error.response?.data?.message || '編輯 QR Code 失敗 Failed to edit QR Code';
      } finally {
        loading.value = false;
      }
    };
    
    // 刪除確認對話框狀態 Delete confirmation dialog state
    const deleteConfirmVisible = ref(false);
    const qrcodeToDelete = ref(null);

    // 打開刪除確認對話框 Open delete confirmation dialog
    const openDeleteConfirm = (row) => {
      qrcodeToDelete.value = row;
      deleteConfirmVisible.value = true;
    };

    // 關閉刪除確認對話框 Close delete confirmation dialog
    const closeDeleteConfirm = () => {
      deleteConfirmVisible.value = false;
      qrcodeToDelete.value = null;
    };

    // 確認刪除 Confirm deletion
    const confirmDelete = async () => {
      try {
        loading.value = true;
        await axios.delete(`/api/qrcode/${qrcodeToDelete.value.id}`);
        await fetchQRCodes();
        closeDeleteConfirm();
      } catch (error) {
        console.error('刪除 QR Code 失敗 Failed to delete QR Code:', error);
        qrcodeForm.value.error = error.response?.data?.message || '刪除 QR Code 失敗 Failed to delete QR Code';
      } finally {
        loading.value = false;
      }
    };
    
    // 登出處理方法 Logout handling method
    const handleLogout = async () => {
      isLoggingOut.value = true;
      try {
        // 實現登出邏輯 Implement logout logic
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        isLoggingOut.value = false;
      }
    };

    // 組件掛載時獲取 QR Code 列表
    onMounted(() => {
      if (currentTab.value === 'qrcode') {
        fetchQRCodes();
      }
    });

    // 監聽標籤切換，切換到 QR Code 時獲取列表
    watch(currentTab, (newTab) => {
      if (newTab === 'qrcode') {
        fetchQRCodes();
      }
    });

    return {
      userName,
      isLoggingOut,
      currentTab,
      tabs,
      loading,
      qrcodeData,
      qrcodeColumns,
      switchTab,
      openAddMaterialDialog,
      openQRCodeDialog,
      closeQRCodeDialog,
      submitQRCodeForm,
      handleLogout,
      qrcodeDialogVisible,
      qrcodeForm,
      editQRCode,
      deleteQRCode: openDeleteConfirm,
      deleteConfirmVisible,
      closeDeleteConfirm,
      confirmDelete,
      qrcodeToDelete
    };
  }
}; 