const { mainPool } = require('../config/database');
const ApiError = require('../utils/apiError');

// URL 驗證函數 URL validation function
const isValidUrl = (url) => {
    try {
        // 檢查是否為有效的 URL Check if it's a valid URL
        new URL(url);
        // 檢查是否為 HTTP 或 HTTPS 協議 Check if it's HTTP or HTTPS protocol
        return url.startsWith('http://') || url.startsWith('https://');
    } catch (error) {
        return false;
    }
};

// 創建 QR Code
const createQRCode = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { name, target_url } = req.body;
        const { companyCode } = req.user;
        
        // 驗證 URL Validate URL
        if (!isValidUrl(target_url)) {
            throw new ApiError(400, '無效的目標 URL Invalid target URL');
        }
        
        // 檢查租戶是否存在且處於活動狀態
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1 AND status = 'active'`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在或已停用');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        // 生成 URL
        const redirect_url = `${process.env.API_BASE_URL}/api/qrcode/redirect/${Date.now()}`;
        const qrcode_url = `${process.env.API_BASE_URL}/api/qrcode/${Date.now()}`;
        
        // 插入新記錄
        const result = await client.query(
            `INSERT INTO public.qrcodes (
                name, qrcode_url, redirect_url, actual_url, tenant_id
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, qrcode_url, redirect_url, target_url, tenantId]
        );
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('創建 QR Code 時發生錯誤:', error);
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(500, '創建 QR Code 失敗 Failed to create QR Code', error));
        }
    } finally {
        client.release();
    }
};

// 獲取 QR Code 列表
const getQRCodes = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { companyCode } = req.user;
        
        // 獲取租戶 ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        const result = await client.query(
            `SELECT * FROM public.qrcodes 
             WHERE tenant_id = $1 
             ORDER BY created_at DESC`,
            [tenantId]
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('獲取 QR Code 列表失敗 Failed to get QR Code list:', error);
        next(new ApiError(500, '獲取 QR Code 列表失敗 Failed to get QR Code list'));
    } finally {
        client.release();
    }
};

// 獲取單個 QR Code
const getQRCode = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        const { companyCode } = req.user;
        
        // 獲取租戶 ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        const result = await client.query(
            `SELECT * FROM public.qrcodes 
             WHERE redirect_url LIKE $1 AND tenant_id = $2`,
            [`%${id}%`, tenantId]
        );
        
        if (result.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('獲取 QR Code 失敗 Failed to get QR Code:', error);
        next(new ApiError(500, '獲取 QR Code 失敗 Failed to get QR Code'));
    } finally {
        client.release();
    }
};

// 更新 QR Code
const updateQRCode = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        const { name, target_url } = req.body;
        const { companyCode } = req.user;
        
        // 驗證 URL Validate URL
        if (!isValidUrl(target_url)) {
            throw new ApiError(400, '無效的目標 URL Invalid target URL');
        }
        
        // 獲取租戶 ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        const result = await client.query(
            `UPDATE public.qrcodes 
             SET name = $1, actual_url = $2, updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 AND tenant_id = $4
             RETURNING *`,
            [name, target_url, id, tenantId]
        );
        
        if (result.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('更新 QR Code 失敗 Failed to update QR Code:', error);
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(500, '更新 QR Code 失敗 Failed to update QR Code'));
        }
    } finally {
        client.release();
    }
};

// 刪除 QR Code
const deleteQRCode = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        const { companyCode } = req.user;
        
        // 獲取租戶 ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        const result = await client.query(
            `DELETE FROM public.qrcodes 
             WHERE id = $1 AND tenant_id = $2
             RETURNING *`,
            [id, tenantId]
        );
        
        if (result.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        res.json({
            success: true,
            message: 'QR Code 已刪除 QR Code deleted successfully'
        });
    } catch (error) {
        console.error('刪除 QR Code 失敗 Failed to delete QR Code:', error);
        next(new ApiError(500, '刪除 QR Code 失敗 Failed to delete QR Code'));
    } finally {
        client.release();
    }
};

// 處理 QR Code 重定向
const handleRedirect = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        
        // 獲取 QR Code 信息
        const result = await client.query(
            `SELECT id, actual_url FROM public.qrcodes WHERE redirect_url LIKE $1`,
            [`%${id}%`]
        );
        
        if (result.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        const qrCode = result.rows[0];
        
        // 記錄掃描
        await client.query(
            `INSERT INTO public.qrcode_scans (qr_code_id, ip_address, user_agent)
             VALUES ($1, $2, $3)`,
            [qrCode.id, req.ip, req.headers['user-agent']]
        );
        
        // 更新掃描次數
        await client.query(
            `UPDATE public.qrcodes 
             SET scan_count = scan_count + 1
             WHERE id = $1`,
            [qrCode.id]
        );
        
        // 重定向到目標 URL
        res.redirect(qrCode.actual_url);
    } catch (error) {
        console.error('處理重定向失敗 Failed to handle redirect:', error);
        next(new ApiError(500, '處理重定向失敗 Failed to handle redirect'));
    } finally {
        client.release();
    }
};

// 獲取 QR Code 統計信息
const getQRCodeStats = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        const { companyCode } = req.user;
        
        // 獲取租戶 ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        // 驗證 QR Code 屬於當前租戶
        const qrCodeResult = await client.query(
            `SELECT id FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (qrCodeResult.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        // 獲取掃描統計
        const statsResult = await client.query(
            `SELECT 
                COUNT(*) as total_scans,
                COUNT(DISTINCT ip_address) as unique_visitors,
                MIN(scan_time) as first_scan,
                MAX(scan_time) as last_scan
             FROM public.qrcode_scans
             WHERE qr_code_id = $1`,
            [id]
        );
        
        res.json({
            success: true,
            data: statsResult.rows[0]
        });
    } catch (error) {
        console.error('獲取 QR Code 統計信息失敗 Failed to get QR Code stats:', error);
        next(new ApiError(500, '獲取 QR Code 統計信息失敗 Failed to get QR Code stats'));
    } finally {
        client.release();
    }
};

module.exports = {
    createQRCode,
    getQRCodes,
    getQRCode,
    updateQRCode,
    deleteQRCode,
    handleRedirect,
    getQRCodeStats
}; 