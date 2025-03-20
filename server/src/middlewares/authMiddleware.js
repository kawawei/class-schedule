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
                message: '未提供認證令牌'
            });
        }

        // 提取 token Extract token
        const token = authHeader.split(' ')[1];

        try {
            // 驗證 token Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 將用戶信息添加到請求對象 Add user info to request object
            req.user = {
                id: decoded.userId,
                username: decoded.username,
                role: decoded.role,
                companyCode: decoded.companyCode
            };

            // 設置租戶 schema Set tenant schema
            await setTenantSchema(decoded.companyCode);

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: '認證令牌已過期'
                });
            }
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: '無效的認證令牌'
                });
            }

            throw error;
        }
    } catch (error) {
        console.error('認證中間件錯誤:', error);
        res.status(500).json({
            success: false,
            message: '認證失敗'
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
                message: '未經過身份驗證'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: '無權訪問此資源'
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    checkRole
}; 