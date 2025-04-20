const { mainPool } = require('../../config/database');
const ApiError = require('../../utils/apiError');

/**
 * 處理 QR Code 重定向
 * Handle QR Code redirect
 * @param {Object} req - Express 請求對象 Express request object
 * @param {Object} res - Express 響應對象 Express response object
 * @param {Function} next - Express 下一個中間件 Express next middleware
 */
const handleRedirect = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { randomString } = req.params;
        
        console.log('開始處理 QR Code 重定向 Start handling QR Code redirect:', randomString);
        
        // 根據隨機字串查找 QR Code Find QR Code by random string
        const result = await client.query(
            `SELECT actual_url FROM public.qrcodes WHERE random_string = $1`,
            [randomString]
        );
        
        if (result.rows.length === 0) {
            console.error('QR Code 不存在 QR Code not found:', randomString);
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        console.log('找到 QR Code，目標 URL Found QR Code, target URL:', result.rows[0].actual_url);
        
        // 更新掃描次數 Update scan count
        await client.query(
            `UPDATE public.qrcodes 
             SET scan_count = scan_count + 1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE random_string = $1`,
            [randomString]
        );
        
        console.log('掃描次數已更新 Scan count updated');
        
        // 重定向到實際 URL Redirect to actual URL
        res.redirect(result.rows[0].actual_url);
    } catch (error) {
        console.error('重定向失敗 Redirect failed:', error);
        next(new ApiError(500, '重定向失敗 Failed to redirect'));
    } finally {
        client.release();
    }
};

module.exports = {
    handleRedirect
}; 