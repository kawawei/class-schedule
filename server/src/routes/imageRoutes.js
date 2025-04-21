const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadImage, removeImage } = require('../controllers/imageController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 配置 multer 用於處理文件上傳 Configure multer for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制文件大小為5MB Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        // 只允許上傳圖片文件 Only allow image files
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('只允許上傳圖片文件 Only image files are allowed'), false);
        }
        cb(null, true);
    }
});

// 錯誤處理中間件 Error handling middleware
const handleError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: '文件上傳錯誤 File upload error',
            error: err.message
        });
    }
    next(err);
};

/**
 * 上傳圖片路由 Image upload route
 * @route POST /api/images/upload
 * @param {string} [type] - 圖片類型 Image type (optional)
 * @param {number} [width] - 圖片寬度 Image width (optional)
 * @param {number} [height] - 圖片高度 Image height (optional)
 * @param {number} [quality] - 圖片質量 Image quality (optional)
 * @param {string} [format] - 圖片格式 Image format (optional)
 */
router.post('/upload', authMiddleware, upload.single('image'), uploadImage);

/**
 * 刪除圖片路由 Image deletion route
 * @route DELETE /api/images/delete
 * @param {string} imageUrl - 要刪除的圖片URL URL of the image to delete
 */
router.delete('/delete', authMiddleware, removeImage);

module.exports = router; 