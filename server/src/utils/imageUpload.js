const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const crypto = require('crypto');

/**
 * 生成隨機文件名 Generate random filename
 * @returns {string} 隨機字符串 Random string
 */
const generateRandomFilename = () => {
    return crypto.randomBytes(16).toString('hex');
};

/**
 * 確保目錄存在 Ensure directory exists
 * @param {string} dirPath - 目錄路徑 Directory path
 */
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * 獲取租戶的圖片目錄 Get tenant's image directory
 * @param {string} companyCode - 租戶公司代碼 Tenant company code
 * @param {string} type - 圖片類型（如：materials, teachers 等）Image type (e.g., materials, teachers, etc.)
 * @returns {string} 圖片目錄路徑 Image directory path
 */
const getTenantImageDirectory = (companyCode, type) => {
    const baseDir = path.join(__dirname, '../../public/uploads');
    const tenantDir = path.join(baseDir, companyCode, type);
    ensureDirectoryExists(tenantDir);
    return tenantDir;
};

/**
 * 處理圖片上傳 Handle image upload
 * @param {Object} imageFile - 上傳的圖片文件 Uploaded image file
 * @param {string} companyCode - 租戶公司代碼 Tenant company code
 * @param {string} type - 圖片類型 Image type
 * @param {Object} options - 處理選項 Processing options
 * @returns {Promise<string>} 圖片URL Image URL
 */
const handleImageUpload = async (imageFile, companyCode, type, options = {}) => {
    try {
        const {
            width = 800,          // 默認最大寬度 Default max width
            height = 800,         // 默認最大高度 Default max height
            quality = 80,         // 默認質量 Default quality
            format = 'jpeg'       // 默認格式 Default format
        } = options;

        // 獲取租戶圖片目錄 Get tenant image directory
        const uploadDir = getTenantImageDirectory(companyCode, type);
        
        // 生成隨機文件名 Generate random filename
        const filename = `${generateRandomFilename()}.${format}`;
        const filePath = path.join(uploadDir, filename);

        // 處理圖片 Process image
        await sharp(imageFile.buffer)
            .resize(width, height, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .toFormat(format, { quality })
            .toFile(filePath);

        // 返回相對URL Return relative URL
        return `/uploads/${companyCode}/${type}/${filename}`;
    } catch (error) {
        console.error('圖片上傳處理失敗 Image upload processing failed:', error);
        throw new Error('圖片上傳處理失敗 Image upload processing failed');
    }
};

/**
 * 刪除圖片 Delete image
 * @param {string} imageUrl - 圖片URL Image URL
 */
const deleteImage = (imageUrl) => {
    if (!imageUrl) return;

    try {
        const imagePath = path.join(__dirname, '../../public', imageUrl.replace(/^\//, ''));
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    } catch (error) {
        console.error('刪除圖片失敗 Failed to delete image:', error);
        throw new Error('刪除圖片失敗 Failed to delete image');
    }
};

module.exports = {
    handleImageUpload,
    deleteImage,
    getTenantImageDirectory
}; 