const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * URL 驗證函數
 * URL validation function
 * @param {string} url - 要驗證的 URL The URL to validate
 * @returns {boolean} - URL 是否有效 Whether the URL is valid
 */
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

/**
 * 獲取下一個可用的序號
 * Get next available sequence number
 * @param {Object} client - 資料庫客戶端 Database client
 * @param {number} tenantId - 租戶 ID Tenant ID
 * @returns {Promise<number>} - 下一個可用的序號 Next available sequence number
 */
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

/**
 * 生成圖片文件名
 * Generate image filename
 * @param {string|number} id - QR Code ID 或隨機字符串 QR Code ID or random string
 * @returns {string} - 生成的文件名 Generated filename
 */
const generateImageFilename = (id) => {
    // 如果 id 是數字，則轉換為 5 位數的字符串，不足補 0
    // If id is a number, convert to 5-digit string, pad with zeros
    if (typeof id === 'number') {
        return `qr${String(id).padStart(5, '0')}.png`;
    }
    // 如果是字符串，直接使用
    // If it's a string, use it directly
    return `qr${id}.png`;
};

/**
 * 生成 QR Code 圖片
 * Generate QR Code image
 * @param {string} url - 要編碼的 URL URL to encode
 * @param {number} id - QR Code ID
 * @param {Object} customOptions - 自定義選項 Custom options
 * @returns {Promise<string>} - 生成的圖片路徑 Generated image path
 */
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

/**
 * 生成隨機英文數字混合字符串
 * Generate random alphanumeric string
 * @param {number} length - 字符串長度 String length (8-12)
 * @returns {string} - 生成的隨機字符串 Generated random string
 */
const generateRandomString = (length = 8) => {
    // 確保長度在8-12之間 Ensure length is between 8-12
    const finalLength = Math.min(Math.max(length, 8), 12);
    
    // 定義可用字符 Define available characters
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    
    // 生成隨機字符串 Generate random string
    let result = '';
    const charsLength = chars.length;
    
    // 確保至少包含一個數字和一個字母 Ensure at least one number and one letter
    result += chars[Math.floor(Math.random() * 26)]; // 一個大寫字母 One uppercase letter
    result += chars[Math.floor(Math.random() * 26) + 26]; // 一個小寫字母 One lowercase letter
    result += chars[Math.floor(Math.random() * 10) + 52]; // 一個數字 One number
    
    // 生成剩餘的字符 Generate remaining characters
    for (let i = result.length; i < finalLength; i++) {
        result += chars[Math.floor(Math.random() * charsLength)];
    }
    
    // 打亂字符串順序 Shuffle the string
    return result.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = {
    isValidUrl,
    getNextAvailableId,
    generateImageFilename,
    generateQRCodeImage,
    generateRandomString
}; 