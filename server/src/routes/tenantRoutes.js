const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 註冊新租戶（公開路由）
router.post('/register', tenantController.register);

// 獲取租戶信息（需要認證）
router.get('/:tenantId', authMiddleware, tenantController.getTenantInfo);

module.exports = router; 