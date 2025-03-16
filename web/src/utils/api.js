// API 服務 API Service

// API 基礎 URL API Base URL
const API_BASE_URL = 'http://localhost:3004/api';

/**
 * 發送 API 請求 Send API request
 * @param {String} endpoint - API 端點 API endpoint
 * @param {String} method - 請求方法 Request method
 * @param {Object} data - 請求數據 Request data
 * @param {Boolean} withAuth - 是否需要認證 Whether authentication is required
 * @returns {Promise} 響應數據 Response data
 */
const apiRequest = async (endpoint, method = 'GET', data = null, withAuth = false) => {
  // 請求選項 Request options
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // 如果需要認證，添加 Authorization 頭部 If authentication is required, add Authorization header
  if (withAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // 如果有請求數據，添加到請求體 If there is request data, add to request body
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    // 發送請求 Send request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // 解析響應 Parse response
    const responseData = await response.json();
    
    // 如果響應不成功，拋出錯誤 If response is not successful, throw error
    if (!response.ok) {
      throw new Error(responseData.message || '請求失敗 Request failed');
    }
    
    // 返回響應數據 Return response data
    return responseData;
  } catch (error) {
    console.error('API 請求錯誤 API request error:', error);
    throw error;
  }
};

/**
 * 認證 API Authentication API
 */
const authAPI = {
  /**
   * 用戶登入 User login
   * @param {String} username - 用戶名 Username
   * @param {String} password - 密碼 Password
   * @returns {Promise} 登入結果 Login result
   */
  login: (username, password) => {
    return apiRequest('/auth/login', 'POST', { username, password });
  },
  
  /**
   * 獲取當前用戶信息 Get current user info
   * @returns {Promise} 用戶信息 User info
   */
  getCurrentUser: () => {
    return apiRequest('/auth/me', 'GET', null, true);
  },
  
  /**
   * 用戶登出 User logout
   * @returns {Promise} 登出結果 Logout result
   */
  logout: () => {
    return apiRequest('/auth/logout', 'POST', null, true);
  }
};

// 導出 API Export API
export {
  apiRequest,
  authAPI
}; 