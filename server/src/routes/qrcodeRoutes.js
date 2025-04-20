const express = require('express');
const router = express.Router();
const qrcodeController = require('../controllers/qrcodeController');
const redirectController = require('../controllers/qrcode/redirectController');
const statsController = require('../controllers/qrcode/statsController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 處理 QR Code 重定向（公開路由）Handle QR Code redirect (public route)
router.get('/redirect/:randomString([A-Za-z0-9]{8,12})', redirectController.handleRedirect);

// 所有其他路由都需要認證 All other routes require authentication
router.use(authMiddleware);

// QR Code 預覽 QR Code preview
router.post('/preview', qrcodeController.generatePreviewQRCode);

// 創建 QR Code
router.post('/', qrcodeController.createQRCode);

// 獲取 QR Code 列表
router.get('/', qrcodeController.getQRCodes);

// 獲取單個 QR Code
router.get('/:id', qrcodeController.getQRCode);

// 下載 QR Code Download QR Code
router.get('/download/:id', qrcodeController.downloadQRCode);

// 更新 QR Code
router.put('/:id', qrcodeController.updateQRCode);

// 刪除 QR Code
router.delete('/:id', qrcodeController.deleteQRCode);

// 獲取掃描統計
router.get('/:id/stats', statsController.getQRCodeStats);

module.exports = router; 