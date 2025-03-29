// 用戶相關的 API 服務 User-related API services
import { apiRequest } from '@/utils/api';

const userAPI = {
  // 獲取當前用戶信息 Get current user info
  getCurrentUser() {
    return apiRequest('/auth/current-user', 'GET');
  },

  // 獲取所有用戶 Get all users
  getAllUsers() {
    return apiRequest('/users', 'GET');
  },

  // 獲取單個用戶 Get single user
  getUser(id) {
    return apiRequest(`/users/${id}`, 'GET');
  },

  // 獲取用戶權限 Get user permissions
  getUserPermissions(id) {
    return apiRequest(`/users/${id}/permissions`, 'GET');
  },

  // 更新用戶權限 Update user permissions
  updateUserPermissions(id, permissions) {
    // 轉換權限格式 Transform permissions format
    const formattedPermissions = {
      permissions: {}
    };

    // 遍歷每個模組的權限 Iterate through each module's permissions
    for (const [moduleKey, enabled] of Object.entries(permissions)) {
      formattedPermissions.permissions[moduleKey] = {
        enabled: enabled
      };
    }
    
    return apiRequest(`/users/${id}/permissions`, 'PUT', formattedPermissions);
  },

  // 創建用戶 Create user
  createUser(userData) {
    return apiRequest('/users', 'POST', userData);
  },

  // 更新用戶 Update user
  updateUser(id, userData) {
    return apiRequest(`/users/${id}`, 'PUT', userData);
  },

  // 刪除用戶 Delete user
  deleteUser(id) {
    return apiRequest(`/users/${id}`, 'DELETE');
  },

  // 更新用戶狀態 Update user status
  updateUserStatus(id, isActive) {
    return apiRequest(`/users/${id}/status`, 'PATCH', { is_active: isActive });
  }
};

export default userAPI; 