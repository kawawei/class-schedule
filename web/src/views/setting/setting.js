// 導入依賴 Import dependencies
import { ref, onMounted } from 'vue';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

// 標籤頁圖標組件 Tab Icon Components
const UserIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  `
};

const SecurityIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  `
};

const BackupIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  `
};

const LogIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  `
};

// 導出設置頁面組件配置 Export settings page component configuration
export default {
  name: 'SettingPage',
  components: {
    UserIcon,
    SecurityIcon,
    BackupIcon,
    LogIcon
  },
  setup() {
    // 用戶信息 User information
    const userName = ref(localStorage.getItem('userName') || '管理員');
    const isLoggingOut = ref(false);
    const loading = ref(false);
    
    // 當前標籤頁 Current tab
    const currentTab = ref('users');
    
    // 標籤頁配置 Tab configuration
    const tabs = [
      {
        key: 'users',
        label: '用戶管理',
        icon: 'UserIcon',
        iconBg: 'rgba(0, 122, 255, 0.1)'
      },
      {
        key: 'security',
        label: '安全設置',
        icon: 'SecurityIcon',
        iconBg: 'rgba(88, 86, 214, 0.1)'
      },
      {
        key: 'backup',
        label: '備份管理',
        icon: 'BackupIcon',
        iconBg: 'rgba(52, 199, 89, 0.1)'
      },
      {
        key: 'logs',
        label: '系統日誌',
        icon: 'LogIcon',
        iconBg: 'rgba(255, 149, 0, 0.1)'
      }
    ];
    
    // 用戶表格列定義 User table column definitions
    const userColumns = [
      {
        key: 'username',
        title: '用戶名',
        width: 150
      },
      {
        key: 'name',
        title: '姓名',
        width: 150
      },
      {
        key: 'role',
        title: '角色',
        width: 120
      },
      {
        key: 'status',
        title: '狀態',
        width: 100
      },
      {
        key: 'createdAt',
        title: '創建時間',
        width: 180
      },
      {
        key: 'actions',
        title: '操作',
        width: 120,
        align: 'center'
      }
    ];
    
    // 模擬用戶數據 Mock user data
    const users = ref([
      {
        id: 1,
        username: 'admin',
        name: '系統管理員',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        username: 'teacher1',
        name: '王老師',
        role: 'teacher',
        status: 'active',
        createdAt: '2024-01-02T00:00:00Z'
      },
      {
        id: 3,
        username: 'staff1',
        name: '李小姐',
        role: 'staff',
        status: 'inactive',
        createdAt: '2024-01-03T00:00:00Z'
      }
    ]);
    
    // 切換標籤頁 Switch tab
    const switchTab = (tab) => {
      currentTab.value = tab;
    };
    
    // 格式化日期 Format date
    const formatDate = (date) => {
      return format(new Date(date), 'yyyy/MM/dd HH:mm', { locale: zhTW });
    };
    
    // 獲取角色名稱 Get role name
    const getRoleName = (role) => {
      const roleMap = {
        admin: '管理員',
        teacher: '老師',
        staff: '職員'
      };
      return roleMap[role] || role;
    };
    
    // 獲取狀態名稱 Get status name
    const getStatusName = (status) => {
      const statusMap = {
        active: '啟用',
        inactive: '停用'
      };
      return statusMap[status] || status;
    };
    
    // 打開添加用戶對話框 Open add user dialog
    const openAddUserDialog = () => {
      // TODO: 實現添加用戶功能 Implement add user functionality
      console.log('Open add user dialog');
    };
    
    // 編輯用戶 Edit user
    const handleEdit = (user) => {
      // TODO: 實現編輯用戶功能 Implement edit user functionality
      console.log('Edit user:', user);
    };
    
    // 刪除用戶 Delete user
    const handleDelete = (user) => {
      // TODO: 實現刪除用戶功能 Implement delete user functionality
      console.log('Delete user:', user);
    };
    
    // 處理登出 Handle logout
    const handleLogout = async () => {
      isLoggingOut.value = true;
      try {
        // TODO: 實現登出功能 Implement logout functionality
        console.log('Logout');
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
      users,
      userColumns,
      loading,
      switchTab,
      formatDate,
      getRoleName,
      getStatusName,
      openAddUserDialog,
      handleEdit,
      handleDelete,
      handleLogout
    };
  }
}; 