const { setTenantSchema } = require('../config/database');

// 租戶中間件
const tenantMiddleware = async (req, res, next) => {
    try {
        // 從請求頭或查詢參數中獲取租戶 ID
        const tenantId = req.headers['x-tenant-id'] || req.query.tenantId;
        
        if (!tenantId) {
            return res.status(400).json({
                success: false,
                message: '缺少租戶 ID'
            });
        }
        
        // 設置當前租戶 Schema
        await setTenantSchema(tenantId);
        
        // 將租戶 ID 添加到請求對象中
        req.tenantId = tenantId;
        
        next();
    } catch (error) {
        console.error('租戶中間件錯誤:', error);
        res.status(500).json({
            success: false,
            message: '租戶設置失敗'
        });
    }
};

module.exports = tenantMiddleware; 