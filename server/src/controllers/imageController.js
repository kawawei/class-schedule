const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const ApiError = require('../utils/apiError');

/**
 * 獲取租戶的圖片目錄 Get tenant's image directory
 * @param {string} companyCode - 租戶公司代碼 Tenant company code
 * @param {string} type - 圖片類型（如：materials, teachers 等）Image type (e.g., materials, teachers, etc.)
 * @returns {string} 圖片目錄路徑 Image directory path
 */
const getTenantImageDirectory = async (companyCode, type) => {
    // 基礎上傳目錄 Base upload directory
    const baseDir = path.join(__dirname, '../../uploads');
    
    // 租戶特定的目錄 Tenant-specific directory
    const tenantDir = path.join(baseDir, companyCode);
    
    // 圖片類型目錄 Image type directory
    const typeDir = path.join(tenantDir, type);
    
    // 確保目錄存在 Ensure directories exist
    await fs.mkdir(baseDir, { recursive: true });
    await fs.mkdir(tenantDir, { recursive: true });
    await fs.mkdir(typeDir, { recursive: true });
    
    return typeDir;
};

/**
 * 上傳圖片 Upload image
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError(400, '沒有上傳文件 No file uploaded');
        }

        // 從請求中獲取租戶信息和圖片類型 Get tenant info and image type from request
        const companyCode = req.user.companyCode;
        const { type = 'materials', width, height, quality = 80, format = 'webp' } = req.body;
        
        // 創建圖片處理實例 Create image processing instance
        let imageProcessor = sharp(req.file.buffer);

        // 根據類型調整圖片大小 Resize image based on type
        if (type === 'thumbnail') {
            imageProcessor = imageProcessor.resize(100, 100, { fit: 'cover' });
        } else if (width || height) {
            imageProcessor = imageProcessor.resize(
                width ? parseInt(width) : null,
                height ? parseInt(height) : null,
                { fit: 'inside' }
            );
        }

        // 設置圖片格式和質量 Set image format and quality
        imageProcessor = imageProcessor[format]({ quality: parseInt(quality) });

        // 處理圖片 Process the image
        const processedImage = await imageProcessor.toBuffer();

        // 生成唯一文件名 Generate unique filename
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${format}`;
        
        // 獲取租戶的圖片目錄 Get tenant's image directory
        const uploadPath = await getTenantImageDirectory(companyCode, type);
        
        // 保存文件 Save the file
        await fs.writeFile(path.join(uploadPath, filename), processedImage);

        // 返回文件URL Return file URL
        res.json({
            success: true,
            imageUrl: `/uploads/${companyCode}/${type}/${filename}`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * 刪除圖片 Delete image
 * @param {Object} req - 請求對象 Request object
 * @param {Object} res - 響應對象 Response object
 */
const removeImage = async (req, res, next) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            throw new ApiError(400, '未提供圖片URL No image URL provided');
        }

        // 從URL中提取路徑信息 Extract path info from URL
        const urlPath = imageUrl.replace(/^\/uploads\//, '');
        const filePath = path.join(__dirname, '../../uploads', urlPath);

        // 檢查文件是否存在 Check if file exists
        try {
            await fs.access(filePath);
        } catch (error) {
            throw new ApiError(404, '圖片不存在 Image not found');
        }

        // 檢查是否屬於當前租戶 Check if belongs to current tenant
        const pathParts = urlPath.split('/');
        if (pathParts[0] !== req.user.companyCode) {
            throw new ApiError(403, '無權訪問此圖片 No permission to access this image');
        }

        // 刪除文件 Delete the file
        await fs.unlink(filePath);

        res.json({
            success: true,
            message: '圖片已成功刪除 Image successfully deleted'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadImage,
    removeImage,
    getTenantImageDirectory
}; 