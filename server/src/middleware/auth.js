// 導入依賴 Import dependencies
const { verifyToken, getTokenFromHeader } = require('../utils/jwt');
const { createSequelizeInstance } = require('../../config/database');

/**
 * 認證中間件 Authentication middleware
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 * @param {Function} next - 下一個中間件 Next middleware
 */
const authenticate = async (req, res, next) => {
  try {
    // 獲取令牌 Get token
    const token = getTokenFromHeader(req);
    
    // 如果沒有令牌，返回未授權錯誤 If no token, return unauthorized error
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '未提供認證令牌 Authentication token not provided'
      });
    }
    
    // 驗證令牌 Verify token
    const decoded = verifyToken(token);
    
    // 如果令牌無效，返回未授權錯誤 If token is invalid, return unauthorized error
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '無效的認證令牌 Invalid authentication token'
      });
    }

    // 獲取公司代碼 Get company code
    const companyCode = decoded.company_code;
    if (!companyCode) {
      return res.status(401).json({
        success: false,
        message: '無效的認證令牌：缺少公司代碼 Invalid authentication token: missing company code'
      });
    }

    // 創建租戶 Sequelize 實例 Create tenant Sequelize instance
    const schema = `tenant_${companyCode.toLowerCase()}`;
    const tenantSequelize = createSequelizeInstance(schema);
    
    // 查找用戶 Find user
    const User = tenantSequelize.models.USER;
    const user = await User.findByPk(decoded.id);
    
    // 如果用戶不存在或未啟用，返回未授權錯誤 If user doesn't exist or is not active, return unauthorized error
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: '用戶不存在或已被禁用 User not found or disabled'
      });
    }
    
    // 將用戶信息和租戶 Sequelize 實例添加到請求對象 Add user info and tenant Sequelize instance to request object
    req.user = user;
    req.tenantSequelize = tenantSequelize;
    
    // 繼續下一個中間件 Continue to next middleware
    next();
  } catch (error) {
    console.error('認證錯誤 Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: '服務器錯誤 Server error'
    });
  }
};

/**
 * 角色授權中間件 Role authorization middleware
 * @param {String[]} roles - 允許的角色數組 Array of allowed roles
 * @returns {Function} 中間件函數 Middleware function
 */
const authorize = (roles = []) => {
  return (req, res, next) => {
    // 檢查用戶是否已認證 Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未認證 Not authenticated'
      });
    }
    
    // 檢查用戶角色是否在允許的角色列表中 Check if user role is in allowed roles list
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '無權訪問此資源 Not authorized to access this resource'
      });
    }
    
    // 繼續下一個中間件 Continue to next middleware
    next();
  };
};

// 導出中間件 Export middleware
module.exports = {
  authenticate,
  authorize
}; 