// 導入依賴 Import dependencies
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// 加載環境變量 Load environment variables
dotenv.config();

// 獲取 JWT 密鑰和過期時間 Get JWT secret and expiration time
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * 生成 JWT 令牌 Generate JWT token
 * @param {Object} payload - 令牌負載 Token payload
 * @returns {String} JWT令牌 JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * 驗證 JWT 令牌 Verify JWT token
 * @param {String} token - JWT令牌 JWT token
 * @returns {Object|null} 解碼後的負載或null Decoded payload or null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * 從請求頭中獲取令牌 Get token from request headers
 * @param {Object} req - 請求對象 Request object
 * @returns {String|null} 令牌或null Token or null
 */
const getTokenFromHeader = (req) => {
  // 從 Authorization 頭部獲取令牌 Get token from Authorization header
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  return null;
};

// 導出函數 Export functions
module.exports = {
  generateToken,
  verifyToken,
  getTokenFromHeader
}; 