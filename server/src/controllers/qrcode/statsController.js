const { mainPool } = require('../../config/database');
const ApiError = require('../../utils/apiError');

/**
 * 獲取 QR Code 掃描統計
 * Get QR Code scan statistics
 * @param {Object} req - Express 請求對象 Express request object
 * @param {Object} res - Express 響應對象 Express response object
 * @param {Function} next - Express 下一個中間件 Express next middleware
 */
const getQRCodeStats = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        const { companyCode } = req.user;
        
        // 獲取租戶 ID Get tenant ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        // 獲取 QR Code 統計信息 Get QR Code statistics
        const result = await client.query(
            `SELECT 
                scan_count,
                last_scan_at,
                created_at,
                updated_at
             FROM public.qrcodes 
             WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (result.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('獲取 QR Code 統計失敗:', error);
        next(new ApiError(500, '獲取 QR Code 統計失敗 Failed to get QR Code statistics'));
    } finally {
        client.release();
    }
};

module.exports = {
    getQRCodeStats
}; 