const { mainPool } = require('../config/database');
const ApiError = require('../utils/apiError');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');

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
const generateQRCodeImage = async (url, id, customOptions = {}) => {
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

        // 驗證並處理自定義選項 Validate and process custom options
        const validatedOptions = {
            // 錯誤糾正級別（L:7%, M:15%, Q:25%, H:30%）Error correction level
            errorCorrectionLevel: ['L', 'M', 'Q', 'H'].includes(customOptions.errorCorrectionLevel) 
                ? customOptions.errorCorrectionLevel 
                : 'H',
            
            // 圖片寬度（200-1000px）Image width
            width: Math.min(Math.max(Number(customOptions.width) || 400, 200), 1000),
            
            // 邊距（0-4）Margin
            margin: Math.min(Math.max(Number(customOptions.margin) || 1, 0), 4),
            
            // 顏色設置 Color settings
            color: {
                // 前景色（必須是有效的十六進制顏色）Foreground color (must be valid hex)
                dark: /^#[0-9A-Fa-f]{6}$/.test(customOptions.foregroundColor) 
                    ? customOptions.foregroundColor 
                    : customOptions.color?.dark || '#000000',
                
                // 背景色（必須是有效的十六進制顏色）Background color (must be valid hex)
                light: /^#[0-9A-Fa-f]{6}$/.test(customOptions.backgroundColor)
                    ? customOptions.backgroundColor
                    : customOptions.color?.light || '#FFFFFF'
            }
        };
        
        // 生成 QR Code 圖片 Generate QR Code image
        await QRCode.toFile(qrcodePath, url, validatedOptions);
        
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
        const { name, target_url, preview_id, custom_style = {} } = req.body;
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
        
        // 生成重定向 URL Generate redirect URL
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://class-schedule.lihengtech.com.tw:9443/schedule-api'
            : process.env.API_BASE_URL;
        const redirect_url = `${baseUrl}/qrcode/redirect/${id}`;
        
        // 生成 QR Code 圖片，使用預覽時的自定義樣式 Generate QR Code image with custom style from preview
        const qrcode_url = await generateQRCodeImage(redirect_url, id, custom_style);
        
        // 插入新記錄 Insert new record
        const result = await client.query(
            `INSERT INTO public.qrcodes (
                id, name, qrcode_url, redirect_url, actual_url, tenant_id, custom_style
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [id, name, qrcode_url, redirect_url, target_url, tenantId, custom_style]
        );
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('創建 QR Code 失敗:', error);
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(500, '創建 QR Code 失敗 Failed to create QR Code'));
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
        const { name, target_url, custom_style = {} } = req.body;
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
            `SELECT qrcode_url, redirect_url, actual_url, custom_style FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (existingQRCode.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }

        // 檢查目標連結是否有變更 Check if target URL has changed
        const isTargetUrlChanged = existingQRCode.rows[0].actual_url !== target_url;

        // 只允許修改特定字段 Only allow specific fields to be modified
        const allowedFields = [
            'foregroundColor',
            'backgroundColor',
            'margin',
            'width'
        ];
        
        const filteredStyle = Object.keys(custom_style)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = custom_style[key];
                return obj;
            }, {});

        // 合併現有樣式和新的自定義樣式 Merge existing style with new custom style
        const mergedStyle = {
            ...existingQRCode.rows[0].custom_style,
            ...filteredStyle
        };

        // 更新記錄 Update record
        const result = await client.query(
            `UPDATE public.qrcodes 
             SET name = $1, 
                 actual_url = $2,
                 custom_style = $3,
                 scan_count = CASE WHEN $4 THEN 0 ELSE scan_count END,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5 AND tenant_id = $6
             RETURNING *`,
            [name, target_url, mergedStyle, isTargetUrlChanged, id, tenantId]
        );

        // 如果樣式有變更，重新生成 QR Code If style has changed, regenerate QR Code
        if (Object.keys(filteredStyle).length > 0) {
            const qrcode_url = await generateQRCodeImage(
                result.rows[0].redirect_url, 
                id, 
                mergedStyle
            );
            
            await client.query(
                `UPDATE public.qrcodes 
                 SET qrcode_url = $1
                 WHERE id = $2`,
                [qrcode_url, id]
            );
            
            result.rows[0].qrcode_url = qrcode_url;
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('更新 QR Code 失敗:', error);
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
        console.log('收到重定向請求，ID:', id);
        
        // 獲取 QR Code 信息 Get QR Code info
        console.log('正在查詢 QR Code 信息...');
        const result = await client.query(
            `SELECT id, actual_url, tenant_id FROM public.qrcodes WHERE id = $1`,
            [id]
        );
        console.log('查詢結果:', result.rows);
        
        if (result.rows.length === 0) {
            console.error(`QR Code not found for ID: ${id}`);
            return res.status(404).json({
                success: false,
                message: 'QR Code 不存在 QR Code not found'
            });
        }
        
        const qrCode = result.rows[0];
        console.log('找到 QR Code，目標 URL:', qrCode.actual_url);

        // 驗證 URL Validate URL
        if (!isValidUrl(qrCode.actual_url)) {
            console.error(`Invalid target URL: ${qrCode.actual_url}`);
            return res.status(400).json({
                success: false,
                message: '無效的目標 URL Invalid target URL'
            });
        }

        // 驗證租戶狀態 Validate tenant status
        const tenantResult = await client.query(
            `SELECT status FROM public.tenants WHERE id = $1`,
            [qrCode.tenant_id]
        );
        
        if (tenantResult.rows[0]?.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: '租戶無效或已停用 Invalid or inactive tenant'
            });
        }
        
        try {
            // 只更新掃描次數，不再記錄詳細的掃描信息
            // Only update scan count, no longer record detailed scan information
            await client.query(
                `UPDATE public.qrcodes 
                 SET scan_count = scan_count + 1
                 WHERE id = $1`,
                [qrCode.id]
            );
            console.log('掃描次數已更新 Scan count updated');
        } catch (error) {
            console.error('更新掃描次數失敗 Failed to update scan count:', error);
        }
        
        // 重定向到目標 URL Redirect to target URL
        console.log('正在重定向到:', qrCode.actual_url);
        res.redirect(qrCode.actual_url);
    } catch (error) {
        console.error('處理重定向失敗 Failed to handle redirect:', error);
        console.error('錯誤詳情:', {
            message: error.message,
            stack: error.stack,
            query: error.query,
            parameters: error.parameters
        });
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
        
        // 獲取掃描統計（直接從 qrcodes 表獲取）
        // Get scan statistics (directly from qrcodes table)
        const statsResult = await client.query(
            `SELECT 
                scan_count as total_scans,
                scan_count as unique_visitors,
                created_at as first_scan,
                updated_at as last_scan
             FROM public.qrcodes
             WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
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
    const { target_url, custom_style = {}, preview_id } = req.body;  // 添加 preview_id 參數
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
      
      // 如果提供了 preview_id，使用它；否則獲取新的 ID
      // If preview_id is provided, use it; otherwise get a new ID
      const nextId = preview_id || await getNextAvailableId(client, tenantId);
      
      // 生成重定向 URL Generate redirect URL
      const baseUrl = process.env.NODE_ENV === 'production' 
          ? 'https://class-schedule.lihengtech.com.tw:9443/schedule-api'
          : process.env.API_BASE_URL;
      const redirect_url = `${baseUrl}/qrcode/redirect/${nextId}`;
      
      // 生成 QR Code 圖片，傳入自定義樣式 Generate QR Code image with custom style
      const qrcode_url = await generateQRCodeImage(redirect_url, nextId, custom_style);
      
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

// 下載 QR Code 圖片 Download QR Code image
const downloadQRCode = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { id } = req.params;
        const { format = 'png' } = req.query; // 支援的格式：png, svg, jpg, pdf
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
        
        // 獲取 QR Code 信息 Get QR Code info
        const qrcodeResult = await client.query(
            `SELECT qrcode_url, redirect_url, name, custom_style FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (qrcodeResult.rows.length === 0) {
            throw new ApiError(404, 'QR Code 不存在 QR Code not found');
        }
        
        const qrcode = qrcodeResult.rows[0];
        const originalImagePath = path.join(__dirname, '../../public', qrcode.qrcode_url);
        
        // 檢查原始圖片是否存在 Check if original image exists
        if (!fs.existsSync(originalImagePath)) {
            throw new ApiError(404, 'QR Code 圖片不存在 QR Code image not found');
        }
        
        // 根據請求的格式處理圖片 Process image based on requested format
        switch (format.toLowerCase()) {
            case 'png':
                // PNG 格式直接返回原始圖片 Return original PNG image
                res.download(originalImagePath, `${qrcode.name || 'qrcode'}.png`);
                break;
                
            case 'svg':
                // 生成 SVG 格式 Generate SVG format
                const customStyle = qrcode.custom_style || {};
                const svgBuffer = await QRCode.toString(qrcode.redirect_url, {
                    type: 'svg',
                    errorCorrectionLevel: customStyle.errorCorrectionLevel || 'H',
                    width: customStyle.width || 400,
                    margin: customStyle.margin || 1,
                    color: {
                        dark: customStyle.color?.dark || '#000000',
                        light: customStyle.color?.light || '#ffffff'
                    }
                });
                res.setHeader('Content-Type', 'image/svg+xml');
                res.setHeader('Content-Disposition', `attachment; filename="${qrcode.name || 'qrcode'}.svg"`);
                res.send(svgBuffer);
                break;
                
            case 'jpg':
            case 'jpeg':
                // 將 PNG 轉換為 JPG Convert PNG to JPG
                const jpgBuffer = await sharp(originalImagePath)
                    .jpeg()
                    .toBuffer();
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Content-Disposition', `attachment; filename="${qrcode.name || 'qrcode'}.jpg"`);
                res.send(jpgBuffer);
                break;
                
            case 'pdf':
                // 創建 PDF 文件 Create PDF file
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50
                });
                
                // 設置 PDF 響應頭 Set PDF response headers
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${qrcode.name || 'qrcode'}.pdf"`);
                
                // 將 PDF 流導向響應 Pipe PDF stream to response
                doc.pipe(res);
                
                // 添加 QR Code 圖片到 PDF Add QR Code image to PDF
                doc.image(originalImagePath, {
                    fit: [400, 400],
                    align: 'center',
                    valign: 'center'
                });
                
                // 結束 PDF 文檔 End PDF document
                doc.end();
                break;
                
            default:
                throw new ApiError(400, '不支援的格式 Unsupported format');
        }
    } catch (error) {
        console.error('下載 QR Code 失敗 Failed to download QR Code:', error);
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(500, '下載 QR Code 失敗 Failed to download QR Code'));
        }
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
    getQRCodeStats,
    generatePreviewQRCode,
    downloadQRCode
}; 