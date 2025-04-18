const { mainPool } = require('../config/database');
const ApiError = require('../utils/apiError');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

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

// 獲取下一個可用的序號 Get next available sequence number
const getNextAvailableId = async (client, tenantId) => {
    try {
        // 獲取所有已使用的 ID Get all used IDs
        const result = await client.query(
            `SELECT id FROM public.qrcodes 
             WHERE tenant_id = $1 
             ORDER BY id`,
            [tenantId]
        );

        const usedIds = result.rows.map(row => row.id);
        
        // 如果沒有記錄，從 1 開始 If no records, start from 1
        if (usedIds.length === 0) {
            return 1;
        }

        // 找出第一個可用的 ID Find first available ID
        let nextId = 1;
        for (const id of usedIds) {
            if (id !== nextId) {
                return nextId;
            }
            nextId++;
        }
        
        // 如果沒有空缺，返回最大 ID + 1 If no gaps, return max ID + 1
        return nextId;
    } catch (error) {
        console.error('獲取下一個可用序號失敗:', error);
        throw error;
    }
};

// 生成圖片文件名 Generate image filename
const generateImageFilename = (id) => {
    // 將數字轉換為 5 位數的字符串，不足補 0，並加上 qr 前綴
    // Convert number to 5-digit string, pad with zeros, and add qr prefix
    return `qr${String(id).padStart(5, '0')}.png`;
};

// 生成 QR Code 圖片 Generate QR Code image
const generateQRCodeImage = async (url, id) => {
    try {
        // 生成文件名 Generate filename
        const filename = generateImageFilename(id);
        
        // QR Code 圖片保存路徑 QR Code image save path
        const qrcodePath = path.join(__dirname, '../../public/qrcodes', filename);
        
        // 確保目錄存在 Ensure directory exists
        const dir = path.dirname(qrcodePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // 生成 QR Code 圖片 Generate QR Code image
        await QRCode.toFile(qrcodePath, url, {
            errorCorrectionLevel: 'H', // 高容錯率 High error correction level
            width: 400, // 圖片寬度 Image width
            margin: 1, // 邊距 Margin
            color: {
                dark: '#000000', // 二維碼顏色 QR Code color
                light: '#ffffff' // 背景顏色 Background color
            }
        });
        
        // 返回圖片的相對路徑 Return relative path of the image
        return `/qrcodes/${filename}`;
    } catch (error) {
        console.error('生成 QR Code 圖片失敗:', error);
        throw new Error('生成 QR Code 圖片失敗 Failed to generate QR Code image');
    }
};

// 創建 QR Code
const createQRCode = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { name, target_url, preview_id } = req.body;
        const { companyCode } = req.user;
        
        // 驗證 URL Validate URL
        if (!isValidUrl(target_url)) {
            throw new ApiError(400, '無效的目標 URL Invalid target URL');
        }
        
        // 檢查租戶是否存在且處於活動狀態 Check if tenant exists and is active
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1 AND status = 'active'`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在或已停用');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        // 使用預覽時的 ID Use ID from preview
        const id = preview_id;
        
        // 使用預覽時生成的 URL Use URLs generated during preview
        const redirect_url = `${process.env.API_BASE_URL}/qrcode/redirect/${id}`;
        const qrcode_url = `/qrcodes/qr${String(id).padStart(5, '0')}.png`;
        
        // 插入新記錄 Insert new record
        const result = await client.query(
            `INSERT INTO public.qrcodes (
                id, name, qrcode_url, redirect_url, actual_url, tenant_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [id, name, qrcode_url, redirect_url, target_url, tenantId]
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
        
        // 獲取租戶 ID Get tenant ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        
        // 獲取現有 QR Code 信息 Get existing QR Code info
        const existingQRCode = await client.query(
            `SELECT qrcode_url, actual_url FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (existingQRCode.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }

        // 檢查目標連結是否有變更 Check if target URL has changed
        const isTargetUrlChanged = existingQRCode.rows[0].actual_url !== target_url;

        // 更新名稱和目標連結，如果目標連結有變更則重置掃描次數
        // Update name and target URL, reset scan count if target URL has changed
        const result = await client.query(
            `UPDATE public.qrcodes 
             SET name = $1, 
                 actual_url = $2,
                 scan_count = CASE WHEN $3 THEN 0 ELSE scan_count END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND tenant_id = $5
             RETURNING *`,
            [name, target_url, isTargetUrlChanged, id, tenantId]
        );

        // 如果目標連結有變更，清除掃描記錄
        // If target URL has changed, clear scan records
        if (isTargetUrlChanged) {
            await client.query(
                `DELETE FROM public.qrcode_scans WHERE qr_code_id = $1`,
                [id]
            );
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('更新 QR Code 失敗 Failed to update QR Code:', error);
        next(new ApiError(500, '更新 QR Code 失敗 Failed to update QR Code'));
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
        
        // 獲取 QR Code 信息 Get QR Code info
        const qrcodeResult = await client.query(
            `SELECT qrcode_url FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (qrcodeResult.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        // 刪除 QR Code 圖片 Delete QR Code image
        const imagePath = path.join(__dirname, '../../public', qrcodeResult.rows[0].qrcode_url);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
        // 刪除數據庫記錄 Delete database record
        await client.query(
            `DELETE FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
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

// 處理 QR Code 重定向 Handle QR Code redirect
const handleRedirect = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        
        // 獲取 QR Code 信息 Get QR Code info
        const result = await client.query(
            `SELECT id, actual_url FROM public.qrcodes WHERE id = $1`,
            [id]
        );
        
        if (result.rows.length === 0) {
            console.error(`QR Code not found for ID: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'QR Code 不存在 QR Code not found'
            });
        }
        
        const qrCode = result.rows[0];
        
        try {
            // 記錄掃描 Record scan
            await client.query(
                `INSERT INTO public.qrcode_scans (qr_code_id, ip_address, user_agent)
                 VALUES ($1, $2, $3)`,
                [qrCode.id, req.ip, req.headers['user-agent']]
            );
            
            // 更新掃描次數 Update scan count
            await client.query(
                `UPDATE public.qrcodes 
                 SET scan_count = scan_count + 1
                 WHERE id = $1`,
                [qrCode.id]
            );
        } catch (error) {
            // 如果記錄掃描失敗，只記錄錯誤但不中斷重定向
            // If recording scan fails, just log error but don't interrupt redirect
            console.error('記錄掃描信息失敗 Failed to record scan:', error);
        }
        
        // 重定向到目標 URL Redirect to target URL
        res.redirect(qrCode.actual_url);
    } catch (error) {
        console.error('處理重定向失敗 Failed to handle redirect:', error);
        res.status(500).json({
            success: false,
            message: '處理重定向失敗 Failed to handle redirect'
        });
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

// 生成預覽 QR Code Generate preview QR Code
const generatePreviewQRCode = async (req, res, next) => {
  try {
    const { target_url } = req.body;
    const { companyCode } = req.user;
    
    // 驗證 URL Validate URL
    if (!isValidUrl(target_url)) {
      throw new ApiError(400, '無效的目標 URL Invalid target URL');
    }
    
    // 獲取租戶 ID Get tenant ID
    const client = await mainPool.connect();
    try {
      const tenantResult = await client.query(
        `SELECT id FROM public.tenants WHERE company_code = $1`,
        [companyCode]
      );
      
      if (tenantResult.rows.length === 0) {
        throw new ApiError(404, '租戶不存在 Tenant not found');
      }
      
      const tenantId = tenantResult.rows[0].id;
      
      // 獲取下一個可用的序號 Get next available ID
      const nextId = await getNextAvailableId(client, tenantId);
      
      // 生成重定向 URL Generate redirect URL
      const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://class-schedule.lihengtech.com.tw'
          : process.env.API_BASE_URL;
      const redirect_url = `${baseUrl}/qrcode/redirect/${nextId}`;
      
      // 生成 QR Code 圖片 Generate QR Code image
      const qrcode_url = await generateQRCodeImage(redirect_url, nextId);
      
      res.json({
        success: true,
        data: {
          id: nextId,
          redirect_url,
          qrcode_url
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('生成預覽 QR Code 失敗:', error);
    next(new ApiError(500, '生成預覽 QR Code 失敗'));
  }
};

module.exports = {
    createQRCode,
    getQRCodes,
    getQRCode,
    updateQRCode,
    deleteQRCode,
    handleRedirect,
    getQRCodeStats,
    generatePreviewQRCode
}; 