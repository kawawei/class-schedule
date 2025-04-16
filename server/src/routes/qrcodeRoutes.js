const express = require('express');
const router = express.Router();
const qrcodeController = require('../controllers/qrcodeController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 創建 QR Code
router.post('/', authMiddleware, qrcodeController.createQRCode);

// 獲取 QR Code 列表
router.get('/', authMiddleware, qrcodeController.getQRCodes);

// 獲取單個 QR Code
router.get('/:id', authMiddleware, qrcodeController.getQRCode);

// 更新 QR Code
router.put('/:id', authMiddleware, qrcodeController.updateQRCode);

// 刪除 QR Code
router.delete('/:id', authMiddleware, qrcodeController.deleteQRCode);

// 處理 QR Code 重定向
router.get('/redirect/:id', qrcodeController.handleRedirect);

// 獲取掃描統計
router.get('/:id/stats', authMiddleware, qrcodeController.getQRCodeStats);

module.exports = router; 