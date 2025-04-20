const { mainPool } = require('../config/database');
const ApiError = require('../utils/apiError');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const PDFDocument = require('pdfkit');
const { 
    isValidUrl, 
    getNextAvailableId, 
    generateImageFilename, 
    generateQRCodeImage,
    generateRandomString 
} = require('../utils/qrcode');

// 創建 QR Code
const createQRCode = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { target_url, preview_id, custom_style = {}, name = 'New QR Code', qrcode_url } = req.body;
        const { companyCode } = req.user;
        
        console.log('開始創建新的 QR Code Start creating new QR Code:', {
            target_url,
            preview_id,
            custom_style,
            name,
            qrcode_url,
            companyCode
        });
        
        // 驗證目標 URL Validate target URL
        if (!target_url || !isValidUrl(target_url)) {
            console.error('無效的目標 URL Invalid target URL:', target_url);
            throw new ApiError(400, '無效的目標 URL Invalid target URL');
        }
        
        // 獲取租戶 ID Get tenant ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            console.error('租戶不存在 Tenant not found:', companyCode);
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        console.log('已獲取租戶 ID Got tenant ID:', tenantId);

        // 獲取所有已存在的 ID Get all existing IDs
        const existingIdsResult = await client.query(
            `SELECT id FROM public.qrcodes WHERE tenant_id = $1 ORDER BY id`,
            [tenantId]
        );

        // 找出可用的最小 ID Find the smallest available ID
        let newId = 1;
        const existingIds = existingIdsResult.rows.map(row => row.id);
        if (existingIds.length > 0) {
            // 檢查是否有空缺的 ID Check for gaps in IDs
            for (let i = 0; i < existingIds.length; i++) {
                if (existingIds[i] !== i + 1) {
                    newId = i + 1;
                    break;
                }
            }
            // 如果沒有空缺，使用最大 ID + 1 If no gaps, use max ID + 1
            if (newId === 1 && existingIds.length > 0) {
                newId = Math.max(...existingIds) + 1;
            }
        }

        console.log('分配的新 ID New ID assigned:', newId);
        
        // 使用預覽 ID 或生成新的隨機字符串 Use preview ID or generate new random string
        const randomString = preview_id || generateRandomString();
        console.log('使用的隨機字符串 Using random string:', randomString);
        
        // 生成重定向 URL Generate redirect URL
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://class-schedule.lihengtech.com.tw:9443/schedule-api'
            : process.env.API_BASE_URL || 'http://localhost:3006';
        const redirectUrl = `${baseUrl}/qrcode/redirect/${randomString}`;
        console.log('生成的重定向 URL Generated redirect URL:', redirectUrl);

        // 使用預覽圖片路徑或生成新的 QR Code 圖片 Use preview image path or generate new QR Code image
        const finalQRCodeUrl = qrcode_url || await generateQRCodeImage(
            redirectUrl,
            randomString,
            custom_style
        );
        console.log('最終的 QR Code 圖片路徑 Final QR Code image path:', finalQRCodeUrl);
        
        // 插入新記錄 Insert new record with qrcode_url
        const result = await client.query(
            `INSERT INTO public.qrcodes 
             (id, tenant_id, actual_url, redirect_url, random_string, name, qrcode_url, custom_style, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
             RETURNING *`,
            [newId, tenantId, target_url, redirectUrl, randomString, name, finalQRCodeUrl, custom_style]
        );
        
        console.log('QR Code 創建成功 QR Code created successfully:', result.rows[0]);
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('創建 QR Code 失敗 Failed to create QR Code:', error);
        next(new ApiError(500, '創建 QR Code 失敗 Failed to create QR Code'));
    } finally {
        client.release();
    }
};

// 獲取 QR Code 列表
const getQRCodes = async (req, res, next) => {
    const client = await mainPool.connect();
    try {
        const { companyCode } = req.user;
        console.log('開始獲取 QR Code 列表 Start getting QR Code list for company:', companyCode);
        
        // 獲取租戶 ID Get tenant ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            console.error('租戶不存在 Tenant not found:', companyCode);
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        console.log('已獲取租戶 ID Got tenant ID:', tenantId);
        
        const result = await client.query(
            `SELECT * FROM public.qrcodes 
             WHERE tenant_id = $1 
             ORDER BY created_at DESC`,
            [tenantId]
        );
        
        console.log(`找到 ${result.rows.length} 個 QR Code Found ${result.rows.length} QR Codes`);
        result.rows.forEach((qrcode, index) => {
            console.log(`QR Code ${index + 1}:`, {
                id: qrcode.id,
                name: qrcode.name,
                qrcode_url: qrcode.qrcode_url,
                scan_count: qrcode.scan_count,
                created_at: qrcode.created_at
            });
        });
        
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
        
        console.log('開始獲取單個 QR Code Start getting single QR Code:', {
            id,
            companyCode
        });
        
        // 獲取租戶 ID Get tenant ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            console.error('租戶不存在 Tenant not found:', companyCode);
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        console.log('已獲取租戶 ID Got tenant ID:', tenantId);
        
        const result = await client.query(
            `SELECT * FROM public.qrcodes 
             WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (result.rows.length === 0) {
            console.error('QR Code 不存在 QR Code not found:', { id, tenantId });
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        console.log('找到 QR Code Found QR Code:', result.rows[0]);
        
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
        
        console.log('開始更新 QR Code Start updating QR Code:', {
            id,
            name,
            target_url,
            custom_style,
            companyCode
        });
        
        // 驗證 URL Validate URL
        if (!isValidUrl(target_url)) {
            console.error('無效的目標 URL Invalid target URL:', target_url);
            throw new ApiError(400, '無效的目標 URL Invalid target URL');
        }
        
        // 獲取租戶 ID Get tenant ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            console.error('租戶不存在 Tenant not found:', companyCode);
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        console.log('已獲取租戶 ID Got tenant ID:', tenantId);
        
        // 獲取現有 QR Code 信息 Get existing QR Code info
        const existingQRCode = await client.query(
            `SELECT qrcode_url, redirect_url, actual_url, custom_style, random_string FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (existingQRCode.rows.length === 0) {
            console.error('QR Code 不存在 QR Code not found:', { id, tenantId });
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }

        console.log('獲取到現有 QR Code 信息 Got existing QR Code info:', existingQRCode.rows[0]);

        // 檢查目標連結是否有變更 Check if target URL has changed
        const isTargetUrlChanged = existingQRCode.rows[0].actual_url !== target_url;
        console.log('目標連結是否變更 Target URL changed:', {
            old_url: existingQRCode.rows[0].actual_url,
            new_url: target_url,
            isChanged: isTargetUrlChanged
        });

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

        console.log('合併後的樣式 Merged style:', mergedStyle);

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

        console.log('QR Code 記錄已更新 QR Code record updated:', result.rows[0]);

        // 如果樣式有變更，重新生成 QR Code If style has changed, regenerate QR Code
        if (Object.keys(filteredStyle).length > 0) {
            console.log('樣式已變更，重新生成 QR Code Style changed, regenerating QR Code');
            const qrcode_url = await generateQRCodeImage(
                result.rows[0].redirect_url, 
                existingQRCode.rows[0].random_string,  // 使用現有的 random_string Use existing random_string
                mergedStyle
            );
            
            await client.query(
                `UPDATE public.qrcodes 
                 SET qrcode_url = $1
                 WHERE id = $2`,
                [qrcode_url, id]
            );
            
            result.rows[0].qrcode_url = qrcode_url;
            console.log('QR Code 圖片已更新 QR Code image updated:', qrcode_url);
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
        
        console.log('開始刪除 QR Code Start deleting QR Code:', {
            id,
            companyCode
        });
        
        // 獲取租戶 ID Get tenant ID
        const tenantResult = await client.query(
            `SELECT id FROM public.tenants WHERE company_code = $1`,
            [companyCode]
        );
        
        if (tenantResult.rows.length === 0) {
            console.error('租戶不存在 Tenant not found:', companyCode);
            throw new ApiError(404, '租戶不存在 Tenant not found');
        }
        
        const tenantId = tenantResult.rows[0].id;
        console.log('已獲取租戶 ID Got tenant ID:', tenantId);
        
        // 獲取 QR Code 信息 Get QR Code info
        const qrcodeResult = await client.query(
            `SELECT qrcode_url FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (qrcodeResult.rows.length === 0) {
            console.error('QR Code 不存在 QR Code not found:', { id, tenantId });
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        // 刪除 QR Code 圖片 Delete QR Code image
        const qrcodeUrl = qrcodeResult.rows[0].qrcode_url;
        if (qrcodeUrl) {
            const qrcodePath = path.join(__dirname, '../../public', qrcodeUrl.replace(/^\//, ''));
            console.log('準備刪除 QR Code 圖片 Preparing to delete QR Code image:', qrcodePath);
            
            if (fs.existsSync(qrcodePath)) {
                if (fs.statSync(qrcodePath).isFile()) {
                    fs.unlinkSync(qrcodePath);
                    console.log('QR Code 圖片已刪除 QR Code image deleted:', qrcodePath);
                } else {
                    console.warn('QR Code 圖片路徑不是文件 QR Code image path is not a file:', qrcodePath);
                }
            } else {
                console.warn('QR Code 圖片不存在 QR Code image does not exist:', qrcodePath);
            }
        }
        
        // 刪除記錄 Delete record
        await client.query(
            `DELETE FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        console.log('QR Code 記錄已刪除 QR Code record deleted:', { id, tenantId });
        
        res.json({
            success: true,
            message: 'QR Code 已成功刪除 QR Code deleted successfully'
        });
    } catch (error) {
        console.error('刪除 QR Code 失敗:', error);
        next(new ApiError(500, '刪除 QR Code 失敗 Failed to delete QR Code'));
    } finally {
        client.release();
    }
};

// 生成預覽 QR Code
const generatePreviewQRCode = async (req, res, next) => {
    try {
        const { target_url, custom_style = {}, preview_id } = req.body;
        
        // 驗證 URL Validate URL
        if (!isValidUrl(target_url)) {
            throw new ApiError(400, '無效的目標 URL Invalid target URL');
        }
        
        // 使用傳入的 preview_id 或生成新的 Use provided preview_id or generate new one
        const id = preview_id || generateRandomString();
        
        // 生成重定向 URL Generate redirect URL
        const baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://class-schedule.lihengtech.com.tw:9443/schedule-api'
            : process.env.API_BASE_URL || 'http://localhost:3006';
        const redirect_url = `${baseUrl}/qrcode/redirect/${id}`;
        
        // 生成 QR Code 圖片 Generate QR Code image
        const qrcode_url = await generateQRCodeImage(redirect_url, id, custom_style);
        
        res.json({
            success: true,
            data: {
                id,
                qrcode_url,
                redirect_url,
                actual_url: target_url
            }
        });
    } catch (error) {
        console.error('生成預覽 QR Code 失敗:', error);
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(500, '生成預覽 QR Code 失敗 Failed to generate preview QR Code'));
        }
    }
};

// 下載 QR Code
const downloadQRCode = async (req, res, next) => {
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
        
        // 獲取 QR Code 信息 Get QR Code info
        const result = await client.query(
            `SELECT qrcode_url, name FROM public.qrcodes WHERE id = $1 AND tenant_id = $2`,
            [id, tenantId]
        );
        
        if (result.rows.length === 0) {
            return next(new ApiError(404, 'QR Code 不存在 QR Code not found'));
        }
        
        const { qrcode_url, name } = result.rows[0];
        const qrcodePath = path.join(__dirname, '../../public', qrcode_url);
        
        if (!fs.existsSync(qrcodePath)) {
            return next(new ApiError(404, 'QR Code 圖片不存在 QR Code image not found'));
        }
        
        // 設置響應頭 Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', `attachment; filename="${name}.png"`);
        
        // 發送文件 Send file
        res.sendFile(qrcodePath);
    } catch (error) {
        console.error('下載 QR Code 失敗:', error);
        next(new ApiError(500, '下載 QR Code 失敗 Failed to download QR Code'));
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
    generatePreviewQRCode,
    downloadQRCode
}; 