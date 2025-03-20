/**
 * 權限中間件 Permission Middleware
 * 用於檢查用戶是否有特定權限 Used to check if user has specific permissions
 */

/**
 * 檢查用戶是否有特定權限 Check if user has specific permission
 * @param {string} permission - 需要檢查的權限 Required permission
 * @returns {Function} Express middleware function
 */
const checkPermission = (permission) => {
    return (req, res, next) => {
        try {
            // 獲取用戶角色和權限 Get user role and permissions
            const userRole = req.user.role;
            const userPermissions = req.user.permissions || {};

            // 租戶擁有所有權限 Tenant has all permissions
            if (userRole === 'tenant') {
                return next();
            }

            // 檢查用戶是否有特定權限 Check if user has specific permission
            if (!userPermissions[permission]) {
                return res.status(403).json({
                    success: false,
                    message: '沒有權限執行此操作'
                });
            }

            next();
        } catch (error) {
            console.error('權限檢查失敗:', error);
            res.status(500).json({
                success: false,
                message: '權限檢查失敗'
            });
        }
    };
};

module.exports = {
    checkPermission
}; 