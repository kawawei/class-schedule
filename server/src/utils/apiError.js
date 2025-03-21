/**
 * 自定義 API 錯誤類 Custom API Error Class
 * 用於統一處理 API 錯誤響應 Used for unified API error response handling
 */
class ApiError extends Error {
  /**
   * 建構函數 Constructor
   * @param {number} statusCode - HTTP 狀態碼 HTTP status code
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   */
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 建立 400 Bad Request 錯誤 Create 400 Bad Request error
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   * @returns {ApiError} API 錯誤實例 API error instance
   */
  static badRequest(message, errors = null) {
    return new ApiError(400, message, errors);
  }

  /**
   * 建立 401 Unauthorized 錯誤 Create 401 Unauthorized error
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   * @returns {ApiError} API 錯誤實例 API error instance
   */
  static unauthorized(message, errors = null) {
    return new ApiError(401, message, errors);
  }

  /**
   * 建立 403 Forbidden 錯誤 Create 403 Forbidden error
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   * @returns {ApiError} API 錯誤實例 API error instance
   */
  static forbidden(message, errors = null) {
    return new ApiError(403, message, errors);
  }

  /**
   * 建立 404 Not Found 錯誤 Create 404 Not Found error
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   * @returns {ApiError} API 錯誤實例 API error instance
   */
  static notFound(message, errors = null) {
    return new ApiError(404, message, errors);
  }

  /**
   * 建立 409 Conflict 錯誤 Create 409 Conflict error
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   * @returns {ApiError} API 錯誤實例 API error instance
   */
  static conflict(message, errors = null) {
    return new ApiError(409, message, errors);
  }

  /**
   * 建立 422 Unprocessable Entity 錯誤 Create 422 Unprocessable Entity error
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   * @returns {ApiError} API 錯誤實例 API error instance
   */
  static validationError(message, errors = null) {
    return new ApiError(422, message, errors);
  }

  /**
   * 建立 500 Internal Server Error 錯誤 Create 500 Internal Server Error
   * @param {string} message - 錯誤訊息 Error message
   * @param {Object} [errors] - 詳細錯誤資訊 Detailed error information
   * @returns {ApiError} API 錯誤實例 API error instance
   */
  static internal(message, errors = null) {
    return new ApiError(500, message, errors);
  }
}

module.exports = ApiError; 