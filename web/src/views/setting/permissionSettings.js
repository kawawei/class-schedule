import { ref, computed, onMounted } from 'vue';
import userAPI from '@/api/userAPI';  // 修正 API 導入
import ToggleSwitch from '@/components/base/ToggleSwitch.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppButton from '@/components/base/AppButton.vue';

// 定義功能模組 Define functional modules
const modules = [
  {
    key: 'users',
    name: '用戶管理 / User Management',
    icon: 'user',
    description: '管理系統用戶，包括創建、編輯和刪除用戶 / Manage system users including create, edit and delete'
  },
  {
    key: 'courses',
    name: '課程管理 / Course Management',
    icon: 'book',
    description: '管理課程信息和排期 / Manage course information and scheduling'
  },
  {
    key: 'teachers',
    name: '教師管理 / Teacher Management',
    icon: 'users',
    description: '管理教師信息和排課 / Manage teacher information and assignments'
  },
  {
    key: 'schedule',
    name: '排課管理 / Schedule Management',
    icon: 'calendar',
    description: '管理課程排期和時間表 / Manage course scheduling and timetables'
  }
];

// 導出組件配置 Export component configuration
export default {
  name: 'PermissionSettings',
  components: {
    ToggleSwitch,
    AppInput,
    AppButton
  },
  
  setup() {
    // 用戶列表 User list
    const userList = ref([]);
    const searchQuery = ref('');
    const selectedUser = ref(null);
    const loading = ref(false);
    const currentUser = ref(null); // 當前登入用戶

    // 權限狀態 Permission states
    const permissions = ref({});

    // 過濾後的用戶列表 Filtered user list
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return userList.value;
      
      const query = searchQuery.value.toLowerCase();
      return userList.value.filter(user => {
        const name = user?.name?.toLowerCase() || '';
        const username = user?.username?.toLowerCase() || '';
        return name.includes(query) || username.includes(query);
      });
    });

    // 檢查是否可以修改權限 Check if can modify permissions
    const canModifyPermissions = computed(() => {
      // 調試日誌 Debug logs
      console.log('Current user:', currentUser.value);
      console.log('Selected user:', selectedUser.value);
      
      // 如果沒有當前用戶信息，從 localStorage 獲取
      if (!currentUser.value) {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Using user data from localStorage:', userData);
        currentUser.value = userData;
      }

      // 如果當前用戶是超級管理員(tenant)，則可以修改任何人的權限
      if (currentUser.value?.role === 'tenant') {
        console.log('User is tenant, can modify permissions');
        return true;
      }
      
      // 如果當前用戶是管理員，且選中的用戶不是管理員或超級管理員，則可以修改
      if (currentUser.value?.role === 'admin' && 
          selectedUser.value?.role !== 'admin' && 
          selectedUser.value?.role !== 'tenant') {
        console.log('User is admin and can modify non-admin permissions');
        return true;
      }
      
      console.log('Cannot modify permissions');
      return false;
    });

    // 獲取用戶列表 Fetch user list
    const fetchUsers = async () => {
      loading.value = true;
      try {
        const response = await userAPI.getAllUsers();
        userList.value = response.data;
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        loading.value = false;
      }
    };

    // 初始化權限狀態 Initialize permission states
    const initializePermissions = (user) => {
      const newPermissions = {};
      modules.forEach(module => {
        // 從用戶權限中獲取模組的啟用狀態
        // Get module enabled state from user permissions
        newPermissions[module.key] = user.permissions?.[module.key]?.enabled || false;
      });
      return newPermissions;
    };

    // 獲取當前用戶信息 Get current user info
    const fetchCurrentUser = async () => {
      try {
        const response = await userAPI.getCurrentUser();
        console.log('Current user response:', response);
        
        if (response.success !== false) {
          currentUser.value = response;
          console.log('Current user set to:', currentUser.value);
        } else {
          // 如果 API 請求失敗，嘗試從 localStorage 獲取
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          console.log('Using cached user data:', userData);
          currentUser.value = userData;
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        // 如果出錯，嘗試從 localStorage 獲取
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('Using cached user data after error:', userData);
        currentUser.value = userData;
      }
    };

    // 選擇用戶 Select user
    const selectUser = async (user) => {
      console.log('Selecting user:', user);
      selectedUser.value = user;
      loading.value = true;
      
      try {
        // 獲取用戶權限 Get user permissions
        const response = await userAPI.getUserPermissions(user.id);
        console.log('User permissions response:', response);
        
        if (response.success !== false) {
          // 使用響應中的 permissions 對象 Use permissions object from response
          const userPermissions = response.permissions || {};
          permissions.value = initializePermissions({ ...user, permissions: userPermissions });
        } else {
          console.error('Failed to get user permissions:', response.message);
          permissions.value = initializePermissions({ ...user, permissions: {} });
        }
      } catch (error) {
        console.error('Failed to fetch user permissions:', error);
        permissions.value = initializePermissions({ ...user, permissions: {} });
      } finally {
        loading.value = false;
      }
    };

    // 更新權限 Update permissions
    const updatePermission = async (moduleKey) => {
      if (!selectedUser.value) return;
      
      try {
        console.log('Updating permission for module:', moduleKey);
        console.log('Can modify permissions:', canModifyPermissions.value);
        
        if (!canModifyPermissions.value) {
          console.log('Permission denied: Cannot modify permissions');
          return;
        }

        // 更新權限狀態 Update permission state
        const updatedPermissions = {
          users: { enabled: false },
          courses: { enabled: false },
          teachers: { enabled: false },
          schedule: { enabled: false }
        };

        // 保持其他模組的當前狀態 Keep current state of other modules
        Object.keys(permissions.value).forEach(key => {
          if (permissions.value[key]) {
            updatedPermissions[key] = { enabled: permissions.value[key] };
          }
        });

        // 切換當前模組的狀態 Toggle current module state
        updatedPermissions[moduleKey] = { 
          enabled: !permissions.value[moduleKey] 
        };

        console.log('Sending updated permissions:', { permissions: updatedPermissions });
        
        // 發送更新請求 Send update request
        const response = await userAPI.updateUserPermissions(selectedUser.value.id, { permissions: updatedPermissions });
        console.log('Update response:', response);

        if (response.success) {
          // 更新本地狀態 Update local state
          permissions.value = Object.keys(updatedPermissions).reduce((acc, key) => {
            acc[key] = updatedPermissions[key].enabled;
            return acc;
          }, {});
        } else {
          console.error('Failed to update permissions:', response.message);
        }
      } catch (error) {
        console.error('Failed to update permissions:', error);
      }
    };

    // 獲取角色名稱 Get role name
    const getRoleName = (role) => {
      const roleMap = {
        tenant: '超級管理員',
        admin: '管理員',
        staff: '工作人員'
      };
      return roleMap[role] || role;
    };

    // 組件掛載時獲取數據 Fetch data when component mounts
    onMounted(async () => {
      await fetchCurrentUser();
      await fetchUsers();
    });

    return {
      userList,
      searchQuery,
      selectedUser,
      loading,
      permissions,
      filteredUsers,
      canModifyPermissions,
      modules,
      selectUser,
      updatePermission,
      getRoleName
    };
  }
};