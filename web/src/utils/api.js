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
      console.log('添加認證頭部 Adding Authorization header:', `Bearer ${token.substring(0, 10)}...`);
      
      // 添加部門ID到請求頭 Add department ID to request header
      const departmentId = localStorage.getItem('departmentId');
      if (departmentId) {
        options.headers['X-Department-ID'] = departmentId;
        console.log('添加部門ID頭部 Adding Department ID header:', departmentId);
      }
    } else {
      console.warn('需要認證但未找到令牌 Authentication required but no token found');
      throw new Error('未找到認證令牌 Authentication token not found');
    }
  }
  
  // 如果有請求數據，添加到請求體 If there is request data, add to request body
  if (data) {
    // 處理請求數據中的日期時間 Process date time in request data
    const processedData = processDateTimeData(data);
    options.body = JSON.stringify(processedData);
  }
  
  try {
    console.log(`發送 ${method} 請求到 Sending ${method} request to: ${API_BASE_URL}${endpoint}`);
    
    // 發送請求 Send request
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // 輸出響應頭部 Log response headers
    console.log('響應頭部 Response headers:', {
      'content-type': response.headers.get('content-type'),
      'content-encoding': response.headers.get('content-encoding'),
      'status': response.status,
      'statusText': response.statusText
    });
    
    // 獲取響應文本 Get response text
    const responseText = await response.text();
    console.log('響應文本 Response text:', responseText);
    
    // 解析響應 Parse response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('解析後的響應數據 Parsed response data:', responseData);
    } catch (parseError) {
      console.error('解析響應數據失敗 Failed to parse response data:', parseError);
      throw new Error('解析響應數據失敗 Failed to parse response data');
    }
    
    // 如果響應不成功，拋出錯誤 If response is not successful, throw error
    if (!response.ok) {
      const errorMessage = responseData.message || `請求失敗 (${response.status}) Request failed (${response.status})`;
      console.error('API 響應錯誤 API response error:', errorMessage);
      throw new Error(errorMessage);
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
   * @param {Object} data - 登入數據 Login data
   * @param {string} data.companyCode - 公司代碼 Company code
   * @param {string} data.username - 用戶名 Username
   * @param {string} data.password - 密碼 Password
   * @returns {Promise} API響應 API response
   */
  login: async (data) => {
    return await apiRequest('/auth/login', 'POST', data);
  },
  
  /**
   * 用戶註冊 User registration
   * @param {Object} data - 註冊數據 Registration data
   * @returns {Promise} API響應 API response
   */
  register: async (data) => {
    return await apiRequest('/auth/register', 'POST', data);
  },
  
  /**
   * 用戶登出 User logout
   * @returns {Promise} API響應 API response
   */
  logout: async () => {
    return await apiRequest('/auth/logout', 'POST', null, true);
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

// 導出 API Export API
export {
  userAPI,
  authAPI,
  teacherAPI,
  departmentAPI,
  courseAPI,
  apiRequest
}; 