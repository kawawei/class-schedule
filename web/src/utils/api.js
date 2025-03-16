// API 服務 API Service
import { toISOString, parseISOString } from './timezone';

// API 基礎 URL API Base URL
const API_BASE_URL = 'http://localhost:3004/api';

/**
 * 處理日期時間數據 Process date time data
 * @param {Object|Array} data - 要處理的數據 Data to process
 * @returns {Object|Array} 處理後的數據 Processed data
 */
const processDateTimeData = (data) => {
  if (!data) return data;
  
  // 如果是數組，遍歷處理每個元素 If it's an array, process each element
  if (Array.isArray(data)) {
    return data.map(item => processDateTimeData(item));
  }
  
  // 如果是對象，處理每個屬性 If it's an object, process each property
  if (typeof data === 'object') {
    const processed = { ...data };
    
    // 遍歷對象的所有屬性 Iterate through all properties of the object
    for (const key in processed) {
      const value = processed[key];
      
      // 如果屬性是日期對象，轉換為ISO字符串 If property is a Date object, convert to ISO string
      if (value instanceof Date) {
        processed[key] = toISOString(value);
      } 
      // 如果屬性是對象或數組，遞歸處理 If property is an object or array, process recursively
      else if (typeof value === 'object' && value !== null) {
        processed[key] = processDateTimeData(value);
      }
    }
    
    return processed;
  }
  
  return data;
};

/**
 * 解析響應數據中的日期時間 Parse date time in response data
 * @param {Object|Array} data - 要解析的數據 Data to parse
 * @returns {Object|Array} 解析後的數據 Parsed data
 */
const parseDateTimeData = (data) => {
  if (!data) return data;
  
  // 如果是數組，遍歷處理每個元素 If it's an array, process each element
  if (Array.isArray(data)) {
    return data.map(item => parseDateTimeData(item));
  }
  
  // 如果是對象，處理每個屬性 If it's an object, process each property
  if (typeof data === 'object') {
    const parsed = { ...data };
    
    // 遍歷對象的所有屬性 Iterate through all properties of the object
    for (const key in parsed) {
      const value = parsed[key];
      
      // 如果屬性是字符串且看起來像ISO日期時間，轉換為日期對象
      // If property is a string and looks like ISO date time, convert to Date object
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        parsed[key] = parseISOString(value);
      } 
      // 如果屬性是對象或數組，遞歸處理 If property is an object or array, process recursively
      else if (typeof value === 'object' && value !== null) {
        parsed[key] = parseDateTimeData(value);
      }
    }
    
    return parsed;
  }
  
  return data;
};

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
    // 處理請求數據中的日期時間 Process date time in request data
    const processedData = processDateTimeData(data);
    options.body = JSON.stringify(processedData);
  }
  
  try {
    // 發送請求 Send request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // 輸出響應頭部 Log response headers
    console.log('響應頭部 Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-encoding': response.headers.get('content-encoding')
    });
    
    // 獲取響應文本 Get response text
    const responseText = await response.text();
    console.log('響應文本 Response text:', responseText);
    
    // 解析響應 Parse response
    const responseData = JSON.parse(responseText);
    console.log('解析後的響應數據 Parsed response data:', responseData);
    
    // 如果響應不成功，拋出錯誤 If response is not successful, throw error
    if (!response.ok) {
      throw new Error(responseData.message || '請求失敗 Request failed');
    }
    
    // 解析響應數據中的日期時間 Parse date time in response data
    const parsedData = parseDateTimeData(responseData);
    console.log('處理日期後的響應數據 Response data after date processing:', parsedData);
    
    // 返回解析後的響應數據 Return parsed response data
    return parsedData;
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

/**
 * 用戶 API User API
 */
const userAPI = {
  /**
   * 獲取所有用戶 Get all users
   * @returns {Promise} 用戶列表 User list
   */
  getAllUsers: () => {
    return apiRequest('/users', 'GET', null, true);
  },
  
  /**
   * 獲取單個用戶 Get single user
   * @param {Number} id - 用戶ID User ID
   * @returns {Promise} 用戶信息 User info
   */
  getUser: (id) => {
    return apiRequest(`/users/${id}`, 'GET', null, true);
  },
  
  /**
   * 創建用戶 Create user
   * @param {Object} userData - 用戶數據 User data
   * @returns {Promise} 創建結果 Creation result
   */
  createUser: (userData) => {
    return apiRequest('/users', 'POST', userData, true);
  },
  
  /**
   * 更新用戶 Update user
   * @param {Number} id - 用戶ID User ID
   * @param {Object} userData - 用戶數據 User data
   * @returns {Promise} 更新結果 Update result
   */
  updateUser: (id, userData) => {
    return apiRequest(`/users/${id}`, 'PUT', userData, true);
  },
  
  /**
   * 刪除用戶 Delete user
   * @param {Number} id - 用戶ID User ID
   * @returns {Promise} 刪除結果 Deletion result
   */
  deleteUser: (id) => {
    return apiRequest(`/users/${id}`, 'DELETE', null, true);
  }
};

// 導出 API Export API
export {
  apiRequest,
  authAPI,
  userAPI
}; 