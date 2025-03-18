// 導入依賴 Import dependencies
const express = require('express');
const authController = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

// 創建路由器 Create router
const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    用戶登入 User login
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    獲取當前用戶信息 Get current user info
 * @access  Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/logout
 * @desc    用戶登出 User logout
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/reset-password
 * @desc    重置密碼 Reset password
 * @access  Public (臨時公開，實際應用中應該是私有的 Temporarily public, should be private in production)
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   POST /api/auth/register
 * @desc    用戶註冊 User registration
 * @access  Public
 */
router.post('/register', authController.register);

// 導出路由器 Export router
module.exports = router; 