// 導入依賴 Import dependencies
const moment = require('moment-timezone');

// 台灣時區 Taiwan timezone
const TAIWAN_TIMEZONE = 'Asia/Taipei';

/**
 * 獲取當前時間（台灣時區） Get current time (Taiwan timezone)
 * @returns {Date} 當前時間 Current time
 */
const getCurrentTime = () => {
  return moment().tz(TAIWAN_TIMEZONE).toDate();
};

/**
 * 格式化日期（台灣時區） Format date (Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @param {string} format - 格式化模式 Format pattern
 * @returns {string} 格式化後的日期字符串 Formatted date string
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).tz(TAIWAN_TIMEZONE).format(format);
};

/**
 * 格式化時間（台灣時區） Format time (Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @param {string} format - 格式化模式 Format pattern
 * @returns {string} 格式化後的時間字符串 Formatted time string
 */
const formatTime = (date, format = 'HH:mm:ss') => {
  return moment(date).tz(TAIWAN_TIMEZONE).format(format);
};

/**
 * 格式化日期時間（台灣時區） Format date and time (Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @param {string} format - 格式化模式 Format pattern
 * @returns {string} 格式化後的日期時間字符串 Formatted date and time string
 */
const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return moment(date).tz(TAIWAN_TIMEZONE).format(format);
};

/**
 * 將日期轉換為ISO字符串（台灣時區） Convert date to ISO string (Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @returns {string} ISO格式的日期時間字符串 ISO formatted date and time string
 */
const toISOString = (date) => {
  return moment(date).tz(TAIWAN_TIMEZONE).toISOString();
};

/**
 * 解析ISO字符串為日期對象（台灣時區） Parse ISO string to date object (Taiwan timezone)
 * @param {string} isoString - ISO格式的日期時間字符串 ISO formatted date and time string
 * @returns {Date} 日期對象 Date object
 */
const parseISOString = (isoString) => {
  return moment(isoString).tz(TAIWAN_TIMEZONE).toDate();
};

/**
 * 獲取日期的開始時間（台灣時區的00:00:00） Get start of day (00:00:00 in Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @returns {Date} 日期的開始時間 Start of day
 */
const startOfDay = (date) => {
  return moment(date).tz(TAIWAN_TIMEZONE).startOf('day').toDate();
};

/**
 * 獲取日期的結束時間（台灣時區的23:59:59） Get end of day (23:59:59 in Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @returns {Date} 日期的結束時間 End of day
 */
const endOfDay = (date) => {
  return moment(date).tz(TAIWAN_TIMEZONE).endOf('day').toDate();
};

/**
 * 處理請求中的日期時間數據 Process date time data in request
 * @param {Object|Array} data - 要處理的數據 Data to process
 * @returns {Object|Array} 處理後的數據 Processed data
 */
const processRequestDateTimeData = (data) => {
  if (!data) return data;
  
  // 如果是數組，遍歷處理每個元素 If it's an array, process each element
  if (Array.isArray(data)) {
    return data.map(item => processRequestDateTimeData(item));
  }
  
  // 如果是對象，處理每個屬性 If it's an object, process each property
  if (typeof data === 'object') {
    const processed = { ...data };
    
    // 遍歷對象的所有屬性 Iterate through all properties of the object
    for (const key in processed) {
      const value = processed[key];
      
      // 如果屬性是字符串且看起來像ISO日期時間，轉換為日期對象
      // If property is a string and looks like ISO date time, convert to Date object
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        processed[key] = parseISOString(value);
      } 
      // 如果屬性是對象或數組，遞歸處理 If property is an object or array, process recursively
      else if (typeof value === 'object' && value !== null) {
        processed[key] = processRequestDateTimeData(value);
      }
    }
    
    return processed;
  }
  
  return data;
};

/**
 * 處理響應中的日期時間數據 Process date time data in response
 * @param {Object|Array} data - 要處理的數據 Data to process
 * @returns {Object|Array} 處理後的數據 Processed data
 */
const processResponseDateTimeData = (data) => {
  if (!data) return data;
  
  // 如果是數組，遍歷處理每個元素 If it's an array, process each element
  if (Array.isArray(data)) {
    return data.map(item => processResponseDateTimeData(item));
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
        processed[key] = processResponseDateTimeData(value);
      }
    }
    
    return processed;
  }
  
  return data;
};

// 導出函數 Export functions
module.exports = {
  TAIWAN_TIMEZONE,
  getCurrentTime,
  formatDate,
  formatTime,
  formatDateTime,
  toISOString,
  parseISOString,
  startOfDay,
  endOfDay,
  processRequestDateTimeData,
  processResponseDateTimeData
}; 