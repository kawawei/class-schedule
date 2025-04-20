import { ref, h, reactive, onMounted, watch, onUnmounted } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppInput from '@/components/base/AppInput.vue';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/api';  // 導入 API_BASE_URL Import API_BASE_URL

// WebSocket 連接 URL（將 http/https 替換為 ws/wss）
// WebSocket connection URL (replace http/https with ws/wss)
const WS_URL = API_BASE_URL.replace(/^http/, 'ws') + '/ws';

// 配置 axios 基礎 URL Configure axios base URL
axios.defaults.baseURL = API_BASE_URL;

// 配置 axios 請求攔截器 Configure axios request interceptor
axios.interceptors.request.use(
  (config) => {
    // 從 localStorage 獲取 token Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // 添加認證頭 Add authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 配置 axios 響應攔截器 Configure axios response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
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
      error: '',
      preview_url: '', // 預覽用的中間跳轉連結 Preview redirect URL
      qrcode_preview: '', // QRCode 預覽圖片 QRCode preview image
      preview_id: null, // 保存預覽 ID Save preview ID
      is_editing: false, // 標記為編輯模式 Mark as edit mode
      custom_style: { // 自定義樣式設置 Custom style settings
        foregroundColor: '#000000', // 前景色 Foreground color
        backgroundColor: '#FFFFFF', // 背景色 Background color
        margin: 4, // 邊距 Margin
        width: 200, // 寬度 Width
        errorCorrectionLevel: 'M', // 容錯級別 Error correction level
        logoUrl: '', // Logo 圖片 URL Logo image URL
        logoSize: 15, // Logo 大小（佔 QR Code 的百分比）Logo size (percentage of QR Code)
        logoData: null // Logo 圖片的 base64 數據 Logo image base64 data
      }
    });
    
    // 更新預覽 Update preview
    const updatePreview = async () => {
      try {
        if (qrcodeForm.value.target_url) {
          const response = await axios.post('/qrcode/preview', {
            target_url: qrcodeForm.value.target_url,
            custom_style: {
              ...qrcodeForm.value.custom_style,
              // 如果有 Logo，確保使用 H 級別的容錯率
              // If logo exists, ensure using H level error correction
              errorCorrectionLevel: qrcodeForm.value.custom_style.logoUrl ? 'H' : qrcodeForm.value.custom_style.errorCorrectionLevel
            },
            preview_id: qrcodeForm.value.preview_id
          });

          qrcodeForm.value.qrcode_preview = `${API_BASE_URL}${response.data.data.qrcode_url}?t=${Date.now()}`;
          
          if (!qrcodeForm.value.is_editing) {
            qrcodeForm.value.preview_url = response.data.data.redirect_url;
            qrcodeForm.value.preview_id = response.data.data.id;
          }
        } else {
          qrcodeForm.value.preview_url = '';
          qrcodeForm.value.qrcode_preview = '';
          qrcodeForm.value.preview_id = null;
        }
      } catch (error) {
        console.error('生成 QR Code 預覽失敗:', error);
        qrcodeForm.value.error = error.response?.data?.message || '生成 QR Code 預覽失敗';
      }
    };
    
    // 獲取 QR Code 列表 Get QR Code list
    const fetchQRCodes = async () => {
      try {
        loading.value = true;
        console.log('Authorization token:', localStorage.getItem('token')); // 添加 token 日誌
        const response = await axios.get('/qrcode');
        qrcodeData.value = response.data.data;
      } catch (error) {
        console.error('獲取 QR Code 列表失敗 Failed to fetch QR Code list:', error);
        console.error('錯誤詳細信息 Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        qrcodeForm.value.error = error.response?.data?.message || '獲取 QR Code 列表失敗 Failed to fetch QR Code list';
      } finally {
        loading.value = false;
      }
    };
    
    // 打開QRCode對話框 Open QRCode dialog
    const openQRCodeDialog = () => {
      qrcodeDialogVisible.value = true;
      // 重置表單，新增模式下需要生成預覽
      // Reset form, need to generate preview in create mode
      qrcodeForm.value = {
        name: '',
        target_url: '',
        error: '',
        preview_url: '',
        qrcode_preview: '',
        preview_id: null,
        is_editing: false,
        custom_style: {
          foregroundColor: '#000000',
          backgroundColor: '#FFFFFF',
          margin: 4,
          width: 200,
          errorCorrectionLevel: 'M',
          logoUrl: '',
          logoSize: 15,
          logoData: null
        }
      };
    };
    
    // 關閉QRCode對話框 Close QRCode dialog
    const closeQRCodeDialog = () => {
      qrcodeDialogVisible.value = false;
      qrcodeForm.value = {
        name: '',
        target_url: '',
        error: '',
        preview_url: '',
        qrcode_preview: '',
        preview_id: null,
        is_editing: false, // 重置編輯模式標記 Reset edit mode flag
        custom_style: {
          foregroundColor: '#000000',
          backgroundColor: '#FFFFFF',
          margin: 4,
          width: 200,
          errorCorrectionLevel: 'M',
          logoUrl: '',
          logoSize: 15,
          logoData: null
        }
      };
    };
    
    // 監聽目標連結變化 Watch target URL changes
    watch(() => qrcodeForm.value.target_url, async (newUrl) => {
      if (newUrl) {
        await updatePreview();
      }
    });

    // 監聽樣式變化 Watch style changes
    watch(() => qrcodeForm.value.custom_style, async (newStyle) => {
      if (qrcodeForm.value.target_url) {
        try {
          const response = await axios.post('/qrcode/preview', {
            target_url: qrcodeForm.value.target_url,
            custom_style: newStyle,
            preview_id: qrcodeForm.value.preview_id  // 保持使用相同的預覽 ID Keep using the same preview ID
          });
          
          qrcodeForm.value.qrcode_preview = `${API_BASE_URL}${response.data.data.qrcode_url}?t=${Date.now()}`; // 添加時間戳避免緩存 Add timestamp to avoid caching
          
          // 只在非編輯模式下更新系統跳轉連結 Only update redirect URL in non-edit mode
          if (!qrcodeForm.value.is_editing) {
            qrcodeForm.value.preview_url = response.data.data.redirect_url;
          }
        } catch (error) {
          console.error('更新 QR Code 預覽失敗:', error);
          qrcodeForm.value.error = error.response?.data?.message || '更新 QR Code 預覽失敗';
        }
      }
    }, { deep: true });

    // 編輯 QR Code Edit QR Code
    const editQRCode = async (row) => {
      try {
        // 在編輯模式下，保持原有的系統跳轉連結和 QR Code，不會隨目標連結變化
        // In edit mode, keep the original redirect URL and QR Code, won't change with target URL
        qrcodeForm.value = {
          id: row.id,
          name: row.name,
          target_url: row.actual_url,
          error: '',
          preview_url: row.redirect_url,
          qrcode_preview: `${API_BASE_URL}${row.qrcode_url}`,
          is_editing: true,
          custom_style: {
            // 在編輯模式下，只保留可以修改的樣式參數
            // In edit mode, only keep modifiable style parameters
            foregroundColor: row.custom_style?.foregroundColor || '#000000',
            backgroundColor: row.custom_style?.backgroundColor || '#FFFFFF',
            margin: row.custom_style?.margin || 4,
            width: row.custom_style?.width || 200,
            // 保持原有的容錯率，不允許修改
            // Keep original error correction level, not modifiable
            errorCorrectionLevel: row.custom_style?.errorCorrectionLevel || 'M',
            logoUrl: row.custom_style?.logoUrl || '',
            logoSize: row.custom_style?.logoSize || 15,
            logoData: row.custom_style?.logoData || null
          }
        };
        qrcodeDialogVisible.value = true;
      } catch (error) {
        console.error('編輯 QR Code 失敗 Failed to edit QR Code:', error);
        qrcodeForm.value.error = error.response?.data?.message || '編輯 QR Code 失敗 Failed to edit QR Code';
      }
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

        // 檢查目標連結格式 Check target URL format
        try {
          const url = new URL(qrcodeForm.value.target_url);
          if (!url.protocol.startsWith('http')) {
            qrcodeForm.value.error = '目標連結必須以 http:// 或 https:// 開頭 Target URL must start with http:// or https://';
            return;
          }
        } catch (e) {
          qrcodeForm.value.error = '請輸入有效的目標連結，例如：https://example.com Please enter a valid target URL, e.g., https://example.com';
          return;
        }

        if (qrcodeForm.value.is_editing) {
          // 更新現有 QR Code Update existing QR Code
          await axios.put(`/qrcode/${qrcodeForm.value.id}`, {
            name: qrcodeForm.value.name,
            target_url: qrcodeForm.value.target_url,
            custom_style: qrcodeForm.value.custom_style // 添加自定義樣式 Add custom style
          });
        } else {
          // 創建新的 QR Code Create new QR Code
          await axios.post('/qrcode', {
            name: qrcodeForm.value.name,
            target_url: qrcodeForm.value.target_url,
            preview_id: qrcodeForm.value.preview_id,
            custom_style: qrcodeForm.value.custom_style // 添加自定義樣式 Add custom style
          });
        }

        await fetchQRCodes();
        closeQRCodeDialog();
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
        await axios.delete(`/qrcode/${qrcodeToDelete.value.id}`);
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

    // WebSocket 相關狀態 WebSocket related state
    const ws = ref(null);
    const isWsConnected = ref(false);
    const reconnectAttempts = ref(0);
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000; // 3 秒後重試 Retry after 3 seconds

    // 連接 WebSocket Connect WebSocket
    const connectWebSocket = () => {
      if (ws.value && ws.value.readyState === WebSocket.OPEN) {
        return; // 如果已經連接，直接返回 If already connected, return directly
      }

      try {
        ws.value = new WebSocket(WS_URL);

        ws.value.onopen = () => {
          console.log('WebSocket connected');
          isWsConnected.value = true;
          reconnectAttempts.value = 0; // 重置重連次數 Reset reconnect attempts
        };

        ws.value.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'qrcode_scanned') {
              // 更新對應 QR Code 的掃描次數 Update scan count of corresponding QR Code
              const qrcode = qrcodeData.value.find(item => item.id === data.qrcode_id);
              if (qrcode) {
                qrcode.scan_count = data.scan_count;
              }
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.value.onclose = () => {
          console.log('WebSocket disconnected');
          isWsConnected.value = false;
          
          // 嘗試重新連接 Try to reconnect
          if (reconnectAttempts.value < maxReconnectAttempts) {
            reconnectAttempts.value++;
            console.log(`Attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`);
            setTimeout(connectWebSocket, reconnectDelay);
          }
        };

        ws.value.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    };

    // 關閉 WebSocket Close WebSocket
    const closeWebSocket = () => {
      if (ws.value) {
        ws.value.close();
        ws.value = null;
      }
    };

    // 在組件掛載時連接 WebSocket Connect WebSocket when component is mounted
    onMounted(() => {
      if (currentTab.value === 'qrcode') {
        fetchQRCodes();
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
        fetchQRCodes();
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

    // 觸發 Logo 上傳 Trigger logo upload
    const triggerLogoUpload = () => {
      const logoInput = document.querySelector('.logo-input');
      if (logoInput) {
        logoInput.click();
      }
    };

    // 處理 Logo 上傳 Handle logo upload
    const handleLogoUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // 驗證文件類型 Validate file type
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        qrcodeForm.value.error = '請上傳 JPG、PNG 或 GIF 格式的圖片 Please upload JPG, PNG or GIF image';
        return;
      }

      // 驗證文件大小（最大 2MB）Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        qrcodeForm.value.error = '圖片大小不能超過 2MB Image size cannot exceed 2MB';
        return;
      }

      try {
        // 讀取文件為 base64 Read file as base64
        const reader = new FileReader();
        reader.onload = async (e) => {
          // 創建圖片對象以獲取尺寸 Create image object to get dimensions
          const img = new Image();
          img.onload = async () => {
            // 驗證圖片尺寸（最小 32x32，最大 2048x2048）
            // Validate image dimensions (min 32x32, max 2048x2048)
            if (img.width < 32 || img.height < 32) {
              qrcodeForm.value.error = '圖片尺寸太小，最小需要 32x32 像素 Image is too small, minimum size is 32x32 pixels';
              return;
            }
            if (img.width > 2048 || img.height > 2048) {
              qrcodeForm.value.error = '圖片尺寸太大，最大允許 2048x2048 像素 Image is too large, maximum size is 2048x2048 pixels';
              return;
            }

            // 更新 Logo 相關設置 Update logo related settings
            qrcodeForm.value.custom_style.logoUrl = e.target.result;
            qrcodeForm.value.custom_style.logoData = e.target.result.split(',')[1];
            qrcodeForm.value.custom_style.logoSize = 15; // 預設大小 15% Default size 15%

            // 如果容錯率低於 H，自動提升到 H
            // If error correction level is lower than H, automatically increase to H
            if (qrcodeForm.value.custom_style.errorCorrectionLevel !== 'H') {
              qrcodeForm.value.custom_style.errorCorrectionLevel = 'H';
            }

            // 清除錯誤信息 Clear error message
            qrcodeForm.value.error = '';

            // 更新預覽 Update preview
            await updatePreview();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('處理 Logo 上傳失敗 Failed to process logo upload:', error);
        qrcodeForm.value.error = '處理 Logo 上傳失敗 Failed to process logo upload';
      }
    };

    // 移除 Logo Remove logo
    const removeLogo = async () => {
      qrcodeForm.value.custom_style.logoUrl = '';
      qrcodeForm.value.custom_style.logoData = null;
      qrcodeForm.value.custom_style.logoSize = 15;
      await updatePreview();
    };

    // 更新 Logo 大小 Update logo size
    const updateLogoSize = async () => {
      const size = qrcodeForm.value.custom_style.logoSize;
      if (size < 5) qrcodeForm.value.custom_style.logoSize = 5;
      if (size > 30) qrcodeForm.value.custom_style.logoSize = 30;
      await updatePreview();
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
      triggerLogoUpload,
      handleLogoUpload,
      removeLogo,
      updateLogoSize,
    };
  }
}; 