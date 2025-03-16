// 導入依賴 Import dependencies
const { processRequestDateTimeData, processResponseDateTimeData } = require('../utils/timezone');

/**
 * 時區中間件 Timezone middleware
 * 處理請求和響應中的日期時間數據 Process date time data in request and response
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 * @param {Function} next - 下一個中間件 Next middleware
 */
const timezoneMiddleware = (req, res, next) => {
  // 保存原始的 res.json 方法 Save original res.json method
  const originalJson = res.json;
  
  // 處理請求體中的日期時間數據 Process date time data in request body
  if (req.body && Object.keys(req.body).length > 0) {
    req.body = processRequestDateTimeData(req.body);
  }
  
  // 重寫 res.json 方法，處理響應數據中的日期時間 Override res.json method to process date time in response data
  res.json = function(data) {
    // 處理響應數據中的日期時間 Process date time in response data
    const processedData = processResponseDateTimeData(data);
    
    // 調用原始的 res.json 方法 Call original res.json method
    return originalJson.call(this, processedData);
  };
  
  // 繼續下一個中間件 Continue to next middleware
  next();
};

// 導出中間件 Export middleware
module.exports = timezoneMiddleware; 