import { ref, reactive, computed, onMounted } from 'vue';
import { userAPI } from '@/utils/api';
import ToggleSwitch from '@/components/base/ToggleSwitch.vue';
import AppInput from '@/components/base/AppInput.vue';
import AppButton from '@/components/base/AppButton.vue';

// 定義功能模組 Define functional modules
const modules = [
  {
    name: 'userManagement',
    label: '用戶管理 / User Management',
    icon: 'user',
    description: '管理系統用戶，包括創建、編輯和刪除用戶 / Manage system users including create, edit and delete'
  },
  {
    name: 'courseManagement',
    label: '課程管理 / Course Management',
    icon: 'book',
    description: '管理課程信息和排期 / Manage course information and scheduling'
  },
  {
    name: 'teacherManagement',
    label: '教師管理 / Teacher Management',
    icon: 'users',
    description: '管理教師信息和排課 / Manage teacher information and assignments'
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

    // 權限狀態 Permission states
    const permissions = reactive({});

    // 過濾後的用戶列表 Filtered user list
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return userList.value;
      
      const query = searchQuery.value.toLowerCase();
      return userList.value.filter(user => {
        const name = user?.name?.toLowerCase() || '';
        const email = user?.email?.toLowerCase() || '';
        return name.includes(query) || email.includes(query);
      });
    });

    // 檢查是否為管理員 Check if user is admin
    const isAdmin = computed(() => {
      return selectedUser.value?.role === 'admin';
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

    // 選擇用戶 Select user
    const selectUser = (user) => {
      selectedUser.value = user;
      // 初始化該用戶的權限狀態 Initialize user's permission states
      permissions.value = modules.reduce((acc, module) => {
        acc[module.name] = user.permissions?.[module.name] || false;
        return acc;
      }, {});
    };

    // 更新權限 Update permissions
    const updatePermission = async (module) => {
      if (!selectedUser.value) return;
      
      try {
        await userAPI.updateUserPermissions(selectedUser.value.id, {
          ...permissions.value,
          [module]: !permissions.value[module]
        });
        permissions.value[module] = !permissions.value[module];
      } catch (error) {
        console.error('Failed to update permissions:', error);
      }
    };

    // 保存所有更改 Save all changes
    const saveChanges = async () => {
      if (!selectedUser.value) return;
      
      try {
        await userAPI.updateUserPermissions(selectedUser.value.id, permissions.value);
      } catch (error) {
        console.error('Failed to save changes:', error);
      }
    };

    // 獲取角色名稱 Get role name
    const getRoleName = (role) => {
      const roleMap = {
        admin: '管理員',
        staff: '工作人員'
      };
      return roleMap[role] || role;
    };

    // 組件掛載時獲取用戶列表 Fetch users when component mounts
    onMounted(() => {
      fetchUsers();
    });

    return {
      userList,
      searchQuery,
      selectedUser,
      loading,
      permissions,
      filteredUsers,
      isAdmin,
      modules,
      selectUser,
      updatePermission,
      saveChanges,
      getRoleName
    };
  }
};