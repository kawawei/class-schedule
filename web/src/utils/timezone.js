// 時區工具 Timezone utilities

// 台灣時區 Taiwan timezone
export const TAIWAN_TIMEZONE = 'Asia/Taipei';

/**
 * 獲取當前時間（台灣時區） Get current time (Taiwan timezone)
 * @returns {Date} 當前時間 Current time
 */
export const getCurrentTime = () => {
  return new Date();
};

/**
 * 格式化日期（台灣時區） Format date (Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @param {Object} options - 格式化選項 Formatting options
 * @returns {string} 格式化後的日期字符串 Formatted date string
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: TAIWAN_TIMEZONE
  };
  
  return new Date(date).toLocaleDateString('zh-TW', { ...defaultOptions, ...options });
};

/**
 * 格式化時間（台灣時區） Format time (Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @param {Object} options - 格式化選項 Formatting options
 * @returns {string} 格式化後的時間字符串 Formatted time string
 */
export const formatTime = (date, options = {}) => {
  const defaultOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TAIWAN_TIMEZONE
  };
  
  return new Date(date).toLocaleTimeString('zh-TW', { ...defaultOptions, ...options });
};

/**
 * 格式化日期時間（台灣時區） Format date and time (Taiwan timezone)
 * @param {Date|string|number} date - 日期對象或可轉換為日期的值 Date object or value convertible to date
 * @param {Object} options - 格式化選項 Formatting options
 * @returns {string} 格式化後的日期時間字符串 Formatted date and time string
 */
export const formatDateTime = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TAIWAN_TIMEZONE
  };
  
  return new Date(date).toLocaleString('zh-TW', { ...defaultOptions, ...options });
};

/**
 * 將日期轉換為ISO字符串（台灣時區） Convert date to ISO string (Taiwan timezone)
 * @param {Date} date - 日期對象 Date object
 * @returns {string} ISO格式的日期時間字符串 ISO formatted date and time string
 */
export const toISOString = (date) => {
  // 創建一個表示台灣時區的日期對象 Create a date object representing Taiwan timezone
  const taiwanDate = new Date(date.toLocaleString('en-US', { timeZone: TAIWAN_TIMEZONE }));
  return taiwanDate.toISOString();
};

/**
 * 解析ISO字符串為日期對象（台灣時區） Parse ISO string to date object (Taiwan timezone)
 * @param {string} isoString - ISO格式的日期時間字符串 ISO formatted date and time string
 * @returns {Date} 日期對象 Date object
 */
export const parseISOString = (isoString) => {
  return new Date(isoString);
};

/**
 * 獲取日期的開始時間（台灣時區的00:00:00） Get start of day (00:00:00 in Taiwan timezone)
 * @param {Date} date - 日期對象 Date object
 * @returns {Date} 日期的開始時間 Start of day
 */
export const startOfDay = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(year, month, day, 0, 0, 0);
};

/**
 * 獲取日期的結束時間（台灣時區的23:59:59） Get end of day (23:59:59 in Taiwan timezone)
 * @param {Date} date - 日期對象 Date object
 * @returns {Date} 日期的結束時間 End of day
 */
export const endOfDay = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(year, month, day, 23, 59, 59);
};

// 導出默認對象 Export default object
export default {
  TAIWAN_TIMEZONE,
  getCurrentTime,
  formatDate,
  formatTime,
  formatDateTime,
  toISOString,
  parseISOString,
  startOfDay,
  endOfDay
}; 