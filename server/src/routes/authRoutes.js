const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 登入路由
router.post('/login', authController.login);

// 登出路由（需要認證）
router.post('/logout', authMiddleware, authController.logout);

module.exports = router; 