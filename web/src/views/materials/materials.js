import { ref, h, reactive, onMounted, watch, onUnmounted } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppInput from '@/components/base/AppInput.vue';
import { API_BASE_URL } from '@/utils/api';  // 導入 API_BASE_URL Import API_BASE_URL
import { useWebSocket } from './utils/websocket';  // 導入 WebSocket 工具 Import WebSocket utility
import { qrcodeColumns, fetchQRCodes, deleteQRCode } from './features/qrcode/qrcodeTable';  // 導入 QRCode 工具 Import QRCode utility
import { useQRCodeForm } from './features/qrcode/qrcodeForm';  // 導入 QRCode 表單工具 Import QRCode form utility
import axios from 'axios';  // 導入 axios Import axios

// WebSocket 連接 URL（將 http/https 替換為 ws/wss）
// WebSocket connection URL (replace http/https with ws/wss)
const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

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

const WarehouseIcon = {
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
      h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }),
      h('polyline', { points: '9 22 9 12 15 12 15 22' })
    ]);
  }
};

const PurchaseIcon = {
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
      h('path', { d: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z' }),
      h('line', { x1: 3, y1: 6, x2: 21, y2: 6 }),
      h('path', { d: 'M16 10a4 4 0 0 1-8 0' })
    ]);
  }
};

// 添加出貨管理圖標 Add shipment management icon
const ShipmentIcon = {
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
      h('path', { d: 'M16 16h6' }),
      h('path', { d: 'M19 13v6' }),
      h('path', { d: 'M2 9l3-3 3 3' }),
      h('path', { d: 'M5 6v14' })
    ]);
  }
};

// 添加採購管理圖標 Add procurement management icon
const ProcurementIcon = {
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
      h('circle', { cx: 9, cy: 21, r: 1 }),
      h('circle', { cx: 20, cy: 21, r: 1 }),
      h('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' })
    ]);
  }
};

// 添加組合商品管理圖標 Add bundle management icon
const BundleIcon = {
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
      h('rect', { x: 2, y: 7, width: 8, height: 14 }),
      h('rect', { x: 14, y: 7, width: 8, height: 14 }),
      h('path', { d: 'M12 3h.01' }),
      h('path', { d: 'M12 21h.01' }),
      h('path', { d: 'M6 3h12' }),
      h('path', { d: 'M6 21h12' })
    ]);
  }
};

// 添加盤點管理圖標 Add stocktaking management icon
const StocktakingIcon = {
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
      h('path', { d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2' }),
      h('rect', { x: 9, y: 3, width: 6, height: 4, rx: 1 }),
      h('path', { d: 'M9 14l2 2 4-4' })
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
    key: 'purchase',
    label: '進貨管理',
    icon: PurchaseIcon,
    iconBg: 'rgba(255, 149, 0, 0.1)'
  },
  {
    key: 'procurement',
    label: '採購管理',
    icon: ProcurementIcon,
    iconBg: 'rgba(175, 82, 222, 0.1)'
  },
  {
    key: 'bundle',
    label: '組合商品管理',
    icon: BundleIcon,
    iconBg: 'rgba(90, 200, 250, 0.1)'
  },
  {
    key: 'shipment',
    label: '出貨管理',
    icon: ShipmentIcon,
    iconBg: 'rgba(52, 199, 89, 0.1)'
  },
  {
    key: 'stocktaking',
    label: '盤點管理',
    icon: StocktakingIcon,
    iconBg: 'rgba(255, 69, 58, 0.1)'
  },
  {
    key: 'qrcode',
    label: 'QRCode管理',
    icon: QRCodeIcon,
    iconBg: 'rgba(88, 86, 214, 0.1)'
  },
  {
    key: 'warehouse',
    label: '倉庫管理',
    icon: WarehouseIcon,
    iconBg: 'rgba(255, 149, 0, 0.1)'
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
    QRCodeIcon,
    WarehouseIcon,
    PurchaseIcon,
    ShipmentIcon,
    ProcurementIcon,
    BundleIcon,
    StocktakingIcon
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

    // 將 API_BASE_URL 添加到返回值中 Add API_BASE_URL to return value
    const apiBaseUrl = ref(API_BASE_URL);

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
        align: 'center',
        render: (row) => {
          // 使用完整的後端 URL Use complete backend URL
          const fullUrl = row.qrcode_url.startsWith('http') 
            ? row.qrcode_url 
            : `${API_BASE_URL}${row.qrcode_url}`;
          return h('img', {
            src: fullUrl,
            alt: row.name || 'QRCode',
            style: {
              width: '50px',
              height: '50px',
              objectFit: 'contain'
            },
            onError: (event) => handleImageError(event)
          });
        }
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
        width: 200,
        align: 'center',
        render: (row) => {
          return h('div', { class: 'action-buttons' }, [
            // 編輯按鈕 Edit button
            h(AppButton, {
              type: 'primary',
              class: 'edit-btn',
              onClick: () => editQRCode(row),
              title: '編輯'
            }, () => h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }, [
              h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
              h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
            ])),
            // 下載按鈕 Download button
            h(AppButton, {
              type: 'info',
              class: 'download-btn',
              onClick: () => openDownloadDialog(row),
              title: '下載'
            }, () => h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }, [
              h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
              h('polyline', { points: '7 10 12 15 17 10' }),
              h('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
            ])),
            // 刪除按鈕 Delete button
            h(AppButton, {
              type: 'danger',
              class: 'delete-btn',
              onClick: () => deleteQRCode(row),
              title: '刪除'
            }, () => h('svg', {
              xmlns: 'http://www.w3.org/2000/svg',
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
              'stroke-linecap': 'round',
              'stroke-linejoin': 'round'
            }, [
              h('path', { d: 'M3 6h18' }),
              h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6' }),
              h('path', { d: 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
            ]))
          ]);
        }
      }
    ];
    
    // 切換標籤頁 Switch tab
    const switchTab = (tab) => {
      currentTab.value = tab;
      if (tab === 'qrcode') {
        fetchQRCodesList();
      }
    };
    
    // 打開添加教材對話框 Open add material dialog
    const openAddMaterialDialog = () => {
      // 將在後續開發實現 Will be implemented later
    };
    
    // QRCode對話框相關 QRCode dialog related
    const qrcodeDialogVisible = ref(false);

    // QRCode 表單相關 QRCode form related
    const {
      form: qrcodeForm,
      resetForm,
      setEditMode,
      updatePreview,
      submitForm,
      handleLogoUpload,
      removeLogo,
      updateLogoSize
    } = useQRCodeForm();
    
    // 獲取 QR Code 列表 Get QR Code list
    const fetchQRCodesList = async () => {
      try {
        loading.value = true;
        qrcodeData.value = await fetchQRCodes();
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
      resetForm();
    };
    
    // 關閉QRCode對話框 Close QRCode dialog
    const closeQRCodeDialog = () => {
      qrcodeDialogVisible.value = false;
      resetForm();
    };
    
    // 編輯 QR Code Edit QR Code
    const editQRCode = async (row) => {
      try {
        // 記錄編輯操作的詳細信息 Log edit operation details
        console.log('開始編輯 QR Code Start editing QR Code:', {
          id: row.id,
          name: row.name,
          actual_url: row.actual_url,
          redirect_url: row.redirect_url,
          random_string: row.random_string,
          custom_style: row.custom_style,
          scan_count: row.scan_count,
          created_at: row.created_at,
          updated_at: row.updated_at
        });

        setEditMode(row);
        qrcodeDialogVisible.value = true;

        // 記錄設置編輯模式後的表單狀態 Log form state after setting edit mode
        console.log('QR Code 編輯模式已設置 QR Code edit mode set:', {
          form_id: qrcodeForm.value.id,
          form_name: qrcodeForm.value.name,
          form_target_url: qrcodeForm.value.target_url,
          form_preview_id: qrcodeForm.value.preview_id,
          form_custom_style: qrcodeForm.value.custom_style
        });
      } catch (error) {
        console.error('編輯 QR Code 失敗 Failed to edit QR Code:', error);
        qrcodeForm.value.error = error.response?.data?.message || '編輯 QR Code 失敗 Failed to edit QR Code';
      }
    };
    
    // 提交QRCode表單 Submit QRCode form
    const submitQRCodeForm = async () => {
      try {
        loading.value = true;
        const success = await submitForm();
        if (success) {
          await fetchQRCodesList();
          closeQRCodeDialog();
        }
      } catch (error) {
        console.error('提交 QR Code 失敗 Failed to submit QR Code:', error);
        qrcodeForm.value.error = error.response?.data?.message || '提交 QR Code 失敗 Failed to submit QR Code';
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
        await deleteQRCode(qrcodeToDelete.value.id);
        await fetchQRCodesList();
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

    // WebSocket 相關狀態 WebSocket related state
    const { ws, isWsConnected, connectWebSocket, closeWebSocket } = useWebSocket((data) => {
      if (data.type === 'qrcode_scanned') {
        // 更新對應 QR Code 的掃描次數 Update scan count of corresponding QR Code
        const qrcode = qrcodeData.value.find(item => item.id === data.qrcode_id);
        if (qrcode) {
          qrcode.scan_count = data.scan_count;
        }
      }
    });

    // 在組件掛載時連接 WebSocket Connect WebSocket when component is mounted
    onMounted(() => {
      if (currentTab.value === 'qrcode') {
        fetchQRCodesList();
        connectWebSocket();
      }
    });

    // 在組件卸載時關閉 WebSocket Close WebSocket when component is unmounted
    onUnmounted(() => {
      closeWebSocket();
    });

    // 監聽標籤切換 Watch tab changes
    watch(currentTab, (newTab) => {
      if (newTab === 'qrcode') {
        fetchQRCodesList();
        connectWebSocket();
      } else {
        closeWebSocket();
      }
    });

    // QR Code 圖片載入錯誤處理 QR Code image error handling
    const handleImageError = (event) => {
      // 設置預設圖片 Set default placeholder image
      event.target.src = '/images/qrcode-placeholder.png';
      // 記錄錯誤 Log the error
      console.warn('QR Code image failed to load:', event.target.alt);
    };

    // 下載對話框狀態 Download dialog state
    const downloadDialogVisible = ref(false);
    const qrcodeToDownload = ref(null);
    const selectedFormat = ref('png');

    // 打開下載對話框 Open download dialog
    const openDownloadDialog = (row) => {
      qrcodeToDownload.value = row;
      downloadDialogVisible.value = true;
    };

    // 關閉下載對話框 Close download dialog
    const closeDownloadDialog = () => {
      downloadDialogVisible.value = false;
      qrcodeToDownload.value = null;
      selectedFormat.value = 'png';
    };

    // 下載 QR Code Download QR Code
    const downloadQRCode = async () => {
      if (loading.value) return; // 如果正在下載中，直接返回 If downloading, return directly
      
      try {
        loading.value = true;
        const format = selectedFormat.value;
        const id = qrcodeToDownload.value.id;
        
        // 使用 axios 發送請求 Send request using axios
        const response = await axios.get(`/qrcode/download/${id}`, {
          params: { format },
          responseType: 'blob'  // 設置響應類型為 blob Set response type to blob
        });
        
        // 創建 Blob URL Create Blob URL
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] 
        });
        const url = window.URL.createObjectURL(blob);
        
        // 創建下載連結 Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `qrcode-${id}.${format}`;
        document.body.appendChild(link);
        link.click();
        
        // 清理 Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
        closeDownloadDialog();
      } catch (error) {
        console.error('下載 QR Code 失敗 Failed to download QR Code:', error);
        // 如果是 blob 響應，需要讀取錯誤信息 If it's a blob response, need to read error message
        if (error.response?.data instanceof Blob) {
          const text = await error.response.data.text();
          try {
            const errorData = JSON.parse(text);
            qrcodeForm.value.error = errorData.message || '下載 QR Code 失敗 Failed to download QR Code';
          } catch (e) {
            qrcodeForm.value.error = '下載 QR Code 失敗 Failed to download QR Code';
          }
        } else {
          qrcodeForm.value.error = error.response?.data?.message || '下載 QR Code 失敗 Failed to download QR Code';
        }
      } finally {
        loading.value = false;
      }
    };

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
      qrcodeToDelete,
      handleImageError,
      API_BASE_URL: apiBaseUrl,
      // 添加下載相關的屬性 Add download related properties
      downloadDialogVisible,
      qrcodeToDownload,
      selectedFormat,
      openDownloadDialog,
      closeDownloadDialog,
      downloadQRCode,
      isWsConnected, // 可選：如果需要在 UI 中顯示連接狀態 Optional: if need to show connection status in UI
      handleLogoUpload,
      removeLogo,
      updateLogoSize,
    };
  }
}; 