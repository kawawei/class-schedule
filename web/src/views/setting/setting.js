// 導入依賴 Import dependencies
import { ref, onMounted, h } from 'vue';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useRouter } from 'vue-router'; // 導入 useRouter 用於頁面導航 Import useRouter for navigation
import { authAPI, userAPI } from '@/utils/api'; // 導入 authAPI 和 userAPI Import authAPI and userAPI

// 標籤頁圖標組件 Tab Icon Components (使用渲染函數代替模板 Using render function instead of template)
const UserIcon = {
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
      h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
      h('circle', { cx: 9, cy: 7, r: 4 }),
      h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
      h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ]);
  }
};

const SecurityIcon = {
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
      h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })
    ]);
  }
};

const BackupIcon = {
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
      h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
      h('polyline', { points: '17 8 12 3 7 8' }),
      h('line', { x1: 12, y1: 3, x2: 12, y2: 15 })
    ]);
  }
};

const LogIcon = {
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
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
      h('line', { x1: 16, y1: 17, x2: 8, y2: 17 }),
      h('polyline', { points: '10 9 9 9 8 9' })
    ]);
  }
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
    // 獲取路由器 Get router
    const router = useRouter();
    
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
        icon: UserIcon,
        iconBg: 'rgba(0, 122, 255, 0.1)'
      },
      {
        key: 'security',
        label: '安全設置',
        icon: SecurityIcon,
        iconBg: 'rgba(88, 86, 214, 0.1)'
      },
      {
        key: 'backup',
        label: '備份管理',
        icon: BackupIcon,
        iconBg: 'rgba(52, 199, 89, 0.1)'
      },
      {
        key: 'logs',
        label: '系統日誌',
        icon: LogIcon,
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
    
    // 用戶數據 User data
    const users = ref([]);
    
    // 獲取用戶列表 Get user list
    const fetchUsers = async () => {
      try {
        loading.value = true;
        console.log('開始獲取用戶列表 Start fetching user list');
        const response = await userAPI.getAllUsers();
        console.log('API 返回的用戶數據 User data returned from API:', response);
        users.value = response.data;
        console.log('設置到 users.value 的數據 Data set to users.value:', users.value);
      } catch (error) {
        console.error('獲取用戶列表失敗 Failed to get user list:', error);
      } finally {
        loading.value = false;
      }
    };
    
    // 組件掛載時獲取用戶列表 Get user list when component is mounted
    onMounted(() => {
      fetchUsers();
    });
    
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
        user: '用戶',
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
    const handleDelete = async (user) => {
      if (confirm(`確定要刪除用戶 "${user.name}" 嗎？ Are you sure you want to delete user "${user.name}"?`)) {
        try {
          loading.value = true;
          await userAPI.deleteUser(user.id);
          // 刪除成功後重新獲取用戶列表 Fetch user list after successful deletion
          await fetchUsers();
        } catch (error) {
          console.error('刪除用戶失敗 Failed to delete user:', error);
        } finally {
          loading.value = false;
        }
      }
    };
    
    // 處理登出 Handle logout
    const handleLogout = async () => {
      isLoggingOut.value = true;
      try {
        // 調用登出 API Call logout API
        await authAPI.logout();
        
        // API 調用成功後，清除身份驗證狀態 After successful API call, clear authentication state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        
        // 導航到登入頁面 Navigate to login page
        router.push({ name: 'Login' });
      } catch (error) {
        console.error('登出失敗 Logout failed:', error);
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