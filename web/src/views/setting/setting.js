// 導入依賴 Import dependencies
import { ref, onMounted, h } from 'vue';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { useRouter } from 'vue-router'; // 導入 useRouter 用於頁面導航 Import useRouter for navigation
import { authAPI, userAPI, departmentAPI } from '@/utils/api'; // 導入 API Import API
import { createApp } from 'vue';
import AppMessage from '@/components/base/AppMessage.vue';
import AppDialog from '@/components/base/AppDialog.vue';

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

// 用戶管理頁面 User management page
const UserManagementTab = {
  // ... existing code ...
};

// 導出設置頁面組件配置 Export settings page component configuration
export default {
  name: 'SettingPage',
  components: {
    UserIcon,
    SecurityIcon,
    BackupIcon,
    LogIcon,
    AppDialog
  },
  setup() {
    // 獲取路由器 Get router
    const router = useRouter();
    
    // 用戶信息 User information
    const userName = ref(JSON.parse(localStorage.getItem('user'))?.name || '管理員');
    const isLoggingOut = ref(false);
    
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
    
    // 加載狀態 Loading state
    const loading = ref(false);
    
    // 用戶列表 User list
    const users = ref([]);
    
    // 用戶對話框狀態 User dialog state
    const userDialogVisible = ref(false);
    const isEditMode = ref(false);
    const currentUser = ref({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'admin', // 默認角色改為管理員 Default role changed to admin
      is_active: true,
      departments: [] // 移除 brands 字段 Removed brands field
    });
    
    // 部門選項 Department options
    const departmentOptions = ref([]);
    
    // 獲取部門列表 Get department list
    const fetchDepartments = async () => {
      try {
        const response = await departmentAPI.getAllDepartments();
        if (response.success && response.data) {
          departmentOptions.value = response.data.map(dept => ({
            value: dept.code,
            label: dept.name
          }));
        } else {
          // 如果 API 調用失敗，使用默認值 If API call fails, use default values
          departmentOptions.value = [
            { value: 'teaching', label: '師資部' },
            { value: 'management', label: '管理部' }
          ];
        }
      } catch (error) {
        console.error('獲取部門列表失敗 Failed to get department list:', error);
        // 如果出錯，使用默認值 If error occurs, use default values
        departmentOptions.value = [
          { value: 'teaching', label: '師資部' },
          { value: 'management', label: '管理部' }
        ];
      }
    };
    
    // 用戶表格列定義 User table column definitions
    const userColumns = [
      {
        key: 'id',
        title: 'ID',
        width: 80
      },
      {
        key: 'username',
        title: '用戶名',
        width: 120
      },
      {
        key: 'name',
        title: '姓名',
        width: 120
      },
      {
        key: 'email',
        title: '電子郵件',
        width: 200
      },
      {
        key: 'role',
        title: '角色',
        width: 100,
        render: (row) => getRoleName(row.role)
      },
      {
        key: 'status',
        title: '狀態',
        width: 100,
        render: (row) => {
          const status = row.is_active ? 'active' : 'inactive';
          return `<span class="status-${status}">${getStatusName(status)}</span>`;
        }
      },
      {
        key: 'createdAt',
        title: '創建時間',
        width: 160,
        render: (row) => formatDate(row.createdAt)
      },
      {
        key: 'actions',
        title: '操作',
        width: 120,
        align: 'center'
      }
    ];
    
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
      if (!date) return '-';
      try {
        // 確保日期是有效的
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.error('無效的日期格式:', date);
          return '-';
        }
        return format(parsedDate, 'yyyy/MM/dd HH:mm', { 
          locale: zhTW,
          timeZone: 'Asia/Taipei'
        });
      } catch (error) {
        console.error('日期格式化錯誤:', error);
        return '-';
      }
    };
    
    // 獲取角色名稱 Get role name
    const getRoleName = (role) => {
      const roleMap = {
        admin: '管理員',
        teacher: '老師'
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
    
    // 重置用戶表單 Reset user form
    const resetUserForm = () => {
      currentUser.value = {
        username: '',
        password: '',
        name: '',
        email: '',
        role: 'admin', // 默認角色改為管理員 Default role changed to admin
        is_active: true, // 默認啟用 Default to active
        departments: [] // 移除 brands 字段 Removed brands field
      };
      isEditMode.value = false;
    };
    
    // 打開添加用戶對話框 Open add user dialog
    const openAddUserDialog = () => {
      resetUserForm();
      userDialogVisible.value = true;
    };
    
    // 打開編輯用戶對話框 Open edit user dialog
    const openEditUserDialog = (user) => {
      isEditMode.value = true;
      // 複製用戶數據，避免直接修改原始數據 Copy user data to avoid modifying original data
      currentUser.value = {
        ...user,
        password: '', // 編輯時不顯示密碼 Don't show password when editing
        is_active: true, // 確保啟用狀態 Ensure active status
        departments: user.departments || []
      };
      userDialogVisible.value = true;
    };
    
    // 驗證用戶表單 Validate user form
    const validateUserForm = () => {
      if (!currentUser.value.username) {
        alert('請輸入用戶名 Please enter username');
        return false;
      }
      
      if (!isEditMode.value && !currentUser.value.password) {
        alert('請輸入密碼 Please enter password');
        return false;
      }
      
      if (!currentUser.value.name) {
        alert('請輸入姓名 Please enter name');
        return false;
      }
      
      return true;
    };
    
    // 保存用戶 Save user
    const saveUser = async () => {
      if (!validateUserForm()) {
        return;
      }
      
      try {
        loading.value = true;
        
        // 準備用戶數據 Prepare user data
        const userData = {
          ...currentUser.value
        };
        
        // 如果是編輯模式且密碼為空，則刪除密碼字段 If edit mode and password is empty, remove password field
        if (isEditMode.value && !userData.password) {
          delete userData.password;
        }
        
        if (isEditMode.value) {
          // 更新用戶 Update user
          await userAPI.updateUser(userData.id, userData);
        } else {
          // 創建用戶 Create user
          await userAPI.createUser(userData);
        }
        
        // 關閉對話框 Close dialog
        userDialogVisible.value = false;
        
        // 重新獲取用戶列表 Fetch user list again
        await fetchUsers();
      } catch (error) {
        console.error('保存用戶失敗 Failed to save user:', error);
        alert(`保存用戶失敗: ${error.message} Failed to save user: ${error.message}`);
      } finally {
        loading.value = false;
      }
    };
    
    // 編輯用戶 Edit user
    const handleEdit = (user) => {
      openEditUserDialog(user);
    };
    
    // 顯示消息的函數 Function to show message
    const showMessage = (type, message) => {
      // 創建一個新的 div 元素作為消息容器 Create a new div element as message container
      const messageContainer = document.createElement('div');
      document.body.appendChild(messageContainer);
      
      // 創建消息組件實例 Create message component instance
      const messageInstance = createApp(AppMessage, {
        type,
        message,
        duration: 3000,
        onClose: () => {
          // 當消息關閉時，移除組件和容器 When message closes, remove component and container
          messageInstance.unmount();
          document.body.removeChild(messageContainer);
        }
      });
      
      // 掛載消息組件 Mount message component
      messageInstance.mount(messageContainer);
    };
    
    // 刪除對話框狀態 Delete dialog state
    const deleteDialogVisible = ref(false);
    const userToDelete = ref(null);

    // 顯示刪除確認對話框 Show delete confirmation dialog
    const showDeleteConfirm = (user) => {
      if (!user) return;
      userToDelete.value = user;
      deleteDialogVisible.value = true;
    };

    // 處理刪除確認 Handle delete confirmation
    const handleDeleteConfirm = async () => {
      if (!userToDelete.value) {
        deleteDialogVisible.value = false;
        return;
      }

      try {
        loading.value = true;
        const response = await userAPI.deleteUser(userToDelete.value.id);
        
        if (response.success) {
          // 直接從本地列表中移除用戶
          users.value = users.value.filter(u => u.id !== userToDelete.value.id);
          showMessage('success', '用戶已成功刪除');
          deleteDialogVisible.value = false;
        } else {
          showMessage('error', response.message || '刪除失敗');
        }
      } catch (error) {
        console.error('刪除用戶失敗:', error);
        showMessage('error', '刪除用戶失敗');
      } finally {
        loading.value = false;
        userToDelete.value = null;
      }
    };

    // 取消刪除 Cancel delete
    const handleDeleteCancel = () => {
      deleteDialogVisible.value = false;
      userToDelete.value = null;
    };
    
    /**
     * 切換用戶狀態 Toggle user status
     * @param {Object} user - 用戶對象 User object
     */
    const toggleUserStatus = async (user) => {
      // 如果是 ID 為 1 的管理員，不允許修改狀態 If it's the admin with ID 1, don't allow status change
      if (user.id === 1) {
        return;
      }
      
      try {
        loading.value = true;
        
        // 創建更新數據，只包含需要更新的字段 Create update data, only include fields that need to be updated
        const updateData = {
          id: user.id,
          is_active: !user.is_active // 切換狀態 Toggle status
        };
        
        // 調用 API 更新用戶狀態 Call API to update user status
        await userAPI.updateUser(user.id, updateData);
        
        // 更新本地用戶數據 Update local user data
        const index = users.value.findIndex(u => u.id === user.id);
        if (index !== -1) {
          users.value[index].is_active = !users.value[index].is_active;
        }
        
        // 顯示成功消息 Show success message
        const statusText = updateData.is_active ? '啟用' : '禁用';
        console.log(`用戶 "${user.name}" 已${statusText} User "${user.name}" has been ${updateData.is_active ? 'activated' : 'deactivated'}`);
      } catch (error) {
        console.error('更新用戶狀態失敗 Failed to update user status:', error);
        alert(`更新用戶狀態失敗: ${error.message} Failed to update user status: ${error.message}`);
      } finally {
        loading.value = false;
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
      loading,
      users,
      userColumns,
      userDialogVisible,
      isEditMode,
      currentUser,
      departmentOptions,
      switchTab,
      formatDate,
      getRoleName,
      getStatusName,
      openAddUserDialog,
      handleEdit,
      showDeleteConfirm,
      handleLogout,
      saveUser,
      toggleUserStatus,
      deleteDialogVisible,
      userToDelete,
      handleDeleteConfirm,
      handleDeleteCancel
    };
  }
}; 