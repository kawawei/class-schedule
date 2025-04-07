import { ref, h, reactive, watch } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppButton from '@/components/base/AppButton.vue';
import DataTable from '@/components/base/DataTable.vue';
import AppDialog from '@/components/base/AppDialog.vue';
import AppInput from '@/components/base/AppInput.vue';
import QRCode from 'qrcode';

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
    const qrcodeData = ref([
      {
        id: 1,
        name: 'QRCode測試1',
        qrcodeUrl: 'https://example.com/qr1',
        redirectUrl: 'https://example.com/redirect1',
        scanCount: 156,
        createdAt: '2024-04-07 14:30:00'
      },
      {
        id: 2,
        name: 'QRCode測試2',
        qrcodeUrl: 'https://example.com/qr2',
        redirectUrl: 'https://example.com/redirect2',
        scanCount: 89,
        createdAt: '2024-04-07 15:45:00'
      }
    ]);

    // QRCode表格列定義 QRCode table column definitions
    const qrcodeColumns = [
      {
        key: 'id',
        title: 'ID',
        width: 80,
        align: 'center'
      },
      {
        key: 'qrcodeUrl',
        title: 'QRCode',
        width: 100,
        render: (row) => `<img src="${row.qrcodeUrl}" alt="QRCode" style="width: 50px; height: 50px;">`
      },
      {
        key: 'name',
        title: '名稱',
        width: 200
      },
      {
        key: 'scanCount',
        title: '掃描次數',
        width: 100,
        align: 'center'
      },
      {
        key: 'redirectUrl',
        title: '跳轉連結',
        width: 300
      },
      {
        key: 'createdAt',
        title: '創建時間',
        width: 160
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
    };
    
    // 打開添加教材對話框 Open add material dialog
    const openAddMaterialDialog = () => {
      // 將在後續開發實現 Will be implemented later
    };
    
    // QRCode對話框相關 QRCode dialog related
    const qrcodeDialogVisible = ref(false);
    const qrcodeForm = reactive({
      name: '',
      redirectUrl: '',
      actualUrl: ''
    });
    const qrcodePreview = ref('');
    const isGeneratingQRCode = ref(false);
    
    // 監聽跳轉連結變化，自動生成QRCode
    // Watch redirect URL changes, automatically generate QRCode
    watch(() => qrcodeForm.redirectUrl, async (newUrl) => {
      if (newUrl) {
        await generateQRCode(newUrl);
      } else {
        qrcodePreview.value = '';
      }
    });
    
    // 生成QRCode Generate QRCode
    const generateQRCode = async (url) => {
      try {
        isGeneratingQRCode.value = true;
        // 生成後端重定向URL Generate backend redirect URL
        const redirectUrl = `${window.location.origin}/api/qrcode/redirect/${Date.now()}`;
        // 生成QRCode圖片 Generate QRCode image
        const qrCodeDataUrl = await QRCode.toDataURL(redirectUrl, {
          width: 200,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        qrcodePreview.value = qrCodeDataUrl;
        // 保存實際的目標URL Save actual target URL
        qrcodeForm.actualUrl = url;
      } catch (error) {
        console.error('生成QRCode失敗 Failed to generate QRCode:', error);
        qrcodePreview.value = '';
      } finally {
        isGeneratingQRCode.value = false;
      }
    };
    
    // 打開QRCode對話框 Open QRCode dialog
    const openQRCodeDialog = () => {
      qrcodeDialogVisible.value = true;
    };
    
    // 關閉QRCode對話框 Close QRCode dialog
    const closeQRCodeDialog = () => {
      qrcodeDialogVisible.value = false;
      // 重置表單 Reset form
      qrcodeForm.name = '';
      qrcodeForm.redirectUrl = '';
      qrcodePreview.value = '';
    };
    
    // 提交QRCode表單 Submit QRCode form
    const submitQRCodeForm = async () => {
      try {
        if (!qrcodeForm.name || !qrcodeForm.redirectUrl) {
          throw new Error('請填寫完整資訊 Please fill in all information');
        }
        
        // 準備提交數據 Prepare submission data
        const qrcodeData = {
          name: qrcodeForm.name,
          redirectUrl: qrcodeForm.actualUrl, // 使用實際的目標URL Use actual target URL
          type: 'redirect', // QRCode類型 QRCode type
          status: 'active' // QRCode狀態 QRCode status
        };
        
        // TODO: 調用API生成QRCode Call API to generate QRCode
        console.log('提交QRCode表單 Submit QRCode form', qrcodeData);
        
        // 關閉對話框 Close dialog
        closeQRCodeDialog();
      } catch (error) {
        console.error('生成QRCode失敗 Failed to generate QRCode:', error);
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
      qrcodePreview,
      isGeneratingQRCode
    };
  }
}; 