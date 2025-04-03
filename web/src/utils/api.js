// API 服務 API Service
import { toISOString, parseISOString } from './timezone';

// API 基礎 URL API Base URL
const API_BASE_URL = 'http://localhost:3006/api';

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
 * API 請求函數 API request function
 * @param {String} endpoint - API端點 API endpoint
 * @param {String} method - 請求方法 Request method
 * @param {Object} data - 請求數據 Request data
 * @param {Boolean} withAuth - 是否需要認證 Whether authentication is required
 * @returns {Promise} 響應數據 Response data
 */
const apiRequest = async (endpoint, method = 'GET', data = null, withAuth = true) => {
  const requestId = Math.random().toString(36).substring(2, 8);
  console.log(`[${new Date().toISOString()}] [Request ${requestId}] 開始 API 請求 Starting API request:`, {
    endpoint,
    method,
    withAuth
  });

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (withAuth) {
      const token = localStorage.getItem('token');
      const companyCode = localStorage.getItem('companyCode');
      
      if (!token) {
        console.log(`[${new Date().toISOString()}] [Request ${requestId}] 未找到認證令牌 Authentication token not found`);
        throw new Error('未登入 Not logged in');
      }
      
      headers['Authorization'] = `Bearer ${token}`;
      if (companyCode) {
        headers['x-company-code'] = companyCode;
      }
      console.log(`[${new Date().toISOString()}] [Request ${requestId}] 已添加認證信息 Added authentication information`);
    }
    
    const config = {
      method,
      headers
    };

    if (data) {
      const processedData = processDateTimeData(data);
      config.body = JSON.stringify(processedData);
      console.log(`[${new Date().toISOString()}] [Request ${requestId}] 請求數據 Request data:`, processedData);
    }
    
    console.log(`[${new Date().toISOString()}] [Request ${requestId}] 發送請求 Sending request to: ${url}`);
    const response = await fetch(url, config);
    const responseData = await response.json();
    
    console.log(`[${new Date().toISOString()}] [Request ${requestId}] 收到響應 Received response:`, {
      status: response.status,
      statusText: response.statusText,
      data: responseData
    });
    
    if (!response.ok) {
      console.error(`[${new Date().toISOString()}] [Request ${requestId}] 請求失敗 Request failed:`, {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });
      return {
        success: false,
        message: responseData.message || '請求失敗 Request failed'
      };
    }
    
    const parsedData = parseDateTimeData(responseData);
    console.log(`[${new Date().toISOString()}] [Request ${requestId}] 請求完成 Request completed successfully`);
    return parsedData;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [Request ${requestId}] 請求出錯 Request error:`, {
      error: error.message,
      stack: error.stack
    });
    return {
      success: false,
      message: error.message || '請求失敗 Request failed'
    };
  }
};

/**
 * 認證 API Authentication API
 */
const authAPI = {
  /**
   * 用戶登入 User login
   * @param {Object} data - 登入數據 Login data
   * @param {string} data.companyCode - 公司代碼 Company code
   * @param {string} data.username - 用戶名 Username
   * @param {string} data.password - 密碼 Password
   * @returns {Promise} API響應 API response
   */
  login: async (data) => {
    return await apiRequest('/auth/login', 'POST', data, false);
  },
  
  /**
   * 用戶註冊 User registration
   * @param {Object} data - 註冊數據 Registration data
   * @returns {Promise} API響應 API response
   */
  register: async (data) => {
    return await apiRequest('/tenants/register', 'POST', data, false);
  },
  
  /**
   * 用戶登出 User logout
   * @returns {Promise} API響應 API response
   */
  logout: async () => {
    // 清除本地存儲 Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('companyCode');
    
    // 返回標準格式的響應 Return standardized response format
    return {
      success: true,
      message: '登出成功 Logout successful'
    };
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
   * 更新用戶權限 Update user permissions
   * @param {Number} id - 用戶ID User ID
   * @param {Object} permissions - 權限設置 Permission settings
   * @returns {Promise} 更新結果 Update result
   */
  updateUserPermissions: (id, permissions) => {
    return apiRequest(`/users/${id}/permissions`, 'PUT', permissions, true);
  },
  
  /**
   * 刪除用戶 Delete user
   * @param {Number} id - 用戶ID User ID
   * @returns {Promise} 刪除結果 Deletion result
   */
  deleteUser: async (id) => {
    console.log(`[${new Date().toISOString()}] 開始刪除用戶 Starting user deletion:`, { userId: id });
    try {
      const result = await apiRequest(`/users/${id}`, 'DELETE', null, true);
      console.log(`[${new Date().toISOString()}] 刪除用戶請求完成 User deletion request completed:`, {
        userId: id,
        success: result.success,
        message: result.message
      });
      return result;
    } catch (error) {
      console.error(`[${new Date().toISOString()}] 刪除用戶請求失敗 User deletion request failed:`, {
        userId: id,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
};

/**
 * 部門 API Department API
 */
const departmentAPI = {
  /**
   * 獲取所有部門 Get all departments
   * @returns {Promise} 部門列表 Department list
   */
  getAllDepartments: () => {
    return apiRequest('/departments', 'GET', null, true);
  },
  
  /**
   * 獲取單個部門 Get single department
   * @param {Number} id - 部門ID Department ID
   * @returns {Promise} 部門信息 Department info
   */
  getDepartment: (id) => {
    return apiRequest(`/departments/${id}`, 'GET', null, true);
  }
};

/**
 * 老師 API Teacher API
 */
const teacherAPI = {
  /**
   * 獲取所有老師 Get all teachers
   * @returns {Promise} 老師列表 Teacher list
   */
  getAllTeachers: () => {
    return apiRequest('/teachers', 'GET', null, true);
  },
  
  /**
   * 獲取單個老師 Get single teacher
   * @param {Number} id - 老師ID Teacher ID
   * @returns {Promise} 老師信息 Teacher info
   */
  getTeacher: (id) => {
    return apiRequest(`/teachers/${id}`, 'GET', null, true);
  },
  
  /**
   * 創建老師 Create teacher
   * @param {Object} teacherData - 老師數據 Teacher data
   * @returns {Promise} 創建結果 Creation result
   */
  createTeacher: (teacherData) => {
    return apiRequest('/teachers', 'POST', teacherData, true);
  },
  
  /**
   * 更新老師 Update teacher
   * @param {Number} id - 老師ID Teacher ID
   * @param {Object} teacherData - 老師數據 Teacher data
   * @returns {Promise} 更新結果 Update result
   */
  updateTeacher: (id, teacherData) => {
    return apiRequest(`/teachers/${id}`, 'PUT', teacherData, true);
  },
  
  /**
   * 刪除老師 Delete teacher
   * @param {Number} id - 老師ID Teacher ID
   * @returns {Promise} 刪除結果 Deletion result
   */
  deleteTeacher: (id) => {
    return apiRequest(`/teachers/${id}`, 'DELETE', null, true);
  },
  
  /**
   * 切換老師狀態 Toggle teacher status
   * @param {Number} id - 老師ID Teacher ID
   * @returns {Promise} 切換結果 Toggle result
   */
  toggleTeacherStatus: (id) => {
    return apiRequest(`/teachers/${id}/toggle-status`, 'PUT', null, true);
  }
};

/**
 * 課程 API Course API
 */
const courseAPI = {
  /**
   * 獲取所有課程 Get all courses
   * @returns {Promise} 課程列表 Course list
   */
  getAllCourses: () => {
    return apiRequest('/courses', 'GET', null, true);
  },
  
  /**
   * 獲取單個課程 Get single course
   * @param {Number} id - 課程ID Course ID
   * @returns {Promise} 課程信息 Course info
   */
  getCourse: (id) => {
    return apiRequest(`/courses/${id}`, 'GET', null, true);
  },
  
  /**
   * 創建課程 Create course
   * @param {Object} courseData - 課程數據 Course data
   * @returns {Promise} 創建結果 Creation result
   */
  createCourse: (courseData) => {
    return apiRequest('/courses', 'POST', courseData, true);
  },
  
  /**
   * 更新課程 Update course
   * @param {Number} id - 課程ID Course ID
   * @param {Object} courseData - 課程數據 Course data
   * @returns {Promise} 更新結果 Update result
   */
  updateCourse: (id, courseData) => {
    return apiRequest(`/courses/${id}`, 'PUT', courseData, true);
  },
  
  /**
   * 刪除課程 Delete course
   * @param {Number} id - 課程ID Course ID
   * @returns {Promise} 刪除結果 Deletion result
   */
  deleteCourse: (id) => {
    return apiRequest(`/courses/${id}`, 'DELETE', null, true);
  },
  
  /**
   * 切換課程狀態 Toggle course status
   * @param {Number} id - 課程ID Course ID
   * @returns {Promise} 切換結果 Toggle result
   */
  toggleCourseStatus: (id) => {
    return apiRequest(`/courses/${id}/toggle-status`, 'PUT', null, true);
  }
};

/**
 * 課程排程 API Schedule API
 */
const scheduleAPI = {
  /**
   * 獲取所有課程排程 Get all schedules
   * @returns {Promise} 課程排程列表 Schedule list
   */
  getAllSchedules: () => {
    return apiRequest('/schedules', 'GET', null, true);
  },
  
  /**
   * 獲取單個課程排程 Get single schedule
   * @param {Number} id - 課程排程ID Schedule ID
   * @returns {Promise} 課程排程信息 Schedule info
   */
  getSchedule: (id) => {
    return apiRequest(`/schedules/${id}`, 'GET', null, true);
  },
  
  /**
   * 創建課程排程 Create schedule
   * @param {Object} scheduleData - 課程排程數據 Schedule data
   * @returns {Promise} 創建結果 Creation result
   */
  createSchedule: (scheduleData) => {
    return apiRequest('/schedules', 'POST', scheduleData, true);
  },
  
  /**
   * 更新課程排程 Update schedule
   * @param {Number} id - 課程排程ID Schedule ID
   * @param {Object} scheduleData - 課程排程數據 Schedule data
   * @returns {Promise} 更新結果 Update result
   */
  updateSchedule: (id, scheduleData) => {
    return apiRequest(`/schedules/${id}`, 'PUT', scheduleData, true);
  },
  
  /**
   * 刪除課程排程 Delete schedule
   * @param {Object} deleteInfo - 刪除信息 Delete info
   * @param {Number} deleteInfo.id - 課程排程ID Schedule ID
   * @param {String} deleteInfo.type - 刪除類型 Delete type ('single' or 'series')
   * @param {String} deleteInfo.series_id - 系列ID Series ID (optional)
   * @returns {Promise} 刪除結果 Deletion result
   */
  deleteSchedule: (deleteInfo) => {
    return apiRequest(`/schedules/${deleteInfo.id}?type=${deleteInfo.type}`, 'DELETE', null, true);
  },
  
  /**
   * 更新課程日期 Update course date
   * @param {number} courseId - 課程ID Course ID
   * @param {Object} data - 更新數據 Update data
   * @param {string} data.date - 新日期 New date
   * @param {boolean} data.isCopy - 是否複製 Whether to copy
   * @returns {Promise} API 響應 API response
   */
  updateCourseDate: (courseId, data) => {
    return apiRequest(`/schedules/${courseId}/date`, 'PUT', data);
  },

  /**
   * 獲取所有老師列表 Get all teachers
   * @returns {Promise} 老師列表 Teacher list
   */
  getTeachers: () => {
    return apiRequest('/teachers', 'GET', null, true);
  },

  /**
   * 獲取所有助教列表 Get all assistants
   * @returns {Promise} 助教列表 Assistant list
   */
  getAssistants: () => {
    return apiRequest('/assistants', 'GET', null, true);
  }
};

// 更新課程日期 Update course date
export const updateCourseDate = async (courseId, data) => {
  try {
    const response = await apiRequest(`/courses/${courseId}/date`, 'PUT', data);
    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('更新課程日期失敗 Failed to update course date:', error);
    return {
      success: false,
      message: error.message || '更新課程日期失敗 Failed to update course date'
    };
  }
};

// 導出 API Export API
export {
  userAPI,
  authAPI,
  teacherAPI,
  departmentAPI,
  courseAPI,
  scheduleAPI,
  apiRequest
}; 