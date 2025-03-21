const jwt = require('jsonwebtoken');
const { setTenantSchema } = require('../config/database');

/**
 * 驗證 JWT Token 的中間件
 * Middleware to verify JWT token
 */
const authMiddleware = async (req, res, next) => {
    try {
        // 從請求頭獲取 token Get token from request header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '未提供認證令牌 No authentication token provided'
            });
        }

        // 提取 token Extract token
        const token = authHeader.split(' ')[1];

        try {
            // 驗證 token Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 從請求頭獲取公司代碼 Get company code from request header
            const headerCompanyCode = req.headers['x-company-code'];

            // 驗證請求頭中的公司代碼與 token 中的是否匹配
            // Verify company code in header matches the one in token
            if (headerCompanyCode && headerCompanyCode !== decoded.companyCode) {
                console.error('公司代碼不匹配 Company code mismatch:', {
                    headerCompanyCode,
                    tokenCompanyCode: decoded.companyCode,
                    userId: decoded.userId,
                    username: decoded.username
                });
                return res.status(403).json({
                    success: false,
                    message: '公司代碼不匹配 Company code mismatch'
                });
            }

            // 將用戶信息添加到請求對象 Add user info to request object
            req.user = {
                id: decoded.userId,
                username: decoded.username,
                role: decoded.role,
                companyCode: decoded.companyCode
            };

            // 設置租戶 schema Set tenant schema
            await setTenantSchema(decoded.companyCode);

            // 添加請求日誌 Add request log
            console.log('用戶認證成功 User authenticated:', {
                userId: req.user.id,
                username: req.user.username,
                role: req.user.role,
                companyCode: req.user.companyCode,
                method: req.method,
                url: req.originalUrl
            });

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: '認證令牌已過期 Authentication token expired'
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: '無效的認證令牌 Invalid authentication token'
                });
            }

            throw error;
        }
    } catch (error) {
        console.error('認證中間件錯誤 Authentication middleware error:', error);
        res.status(500).json({
            success: false,
            message: '認證失敗 Authentication failed'
        });
    }
};

/**
 * 檢查用戶角色的中間件
 * Middleware to check user role
 * @param {string[]} roles - 允許的角色列表 List of allowed roles
 */
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: '未經過身份驗證 Not authenticated'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: '無權訪問此資源 No permission to access this resource'
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    checkRole
}; 