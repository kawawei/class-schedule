// 導入依賴 Import dependencies
const express = require('express');
const userController = require('../controllers/user');
const { authenticate, authorize } = require('../middleware/auth');

// 創建路由器 Create router
const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    獲取所有用戶 Get all users
 * @access  Private (只有管理員可以訪問 Only admin can access)
 */
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    獲取單個用戶 Get single user
 * @access  Private (只有管理員可以訪問 Only admin can access)
 */
router.get('/:id', authenticate, authorize(['admin']), userController.getUser);

/**
 * @route   POST /api/users
 * @desc    創建用戶 Create user
 * @access  Private (只有管理員可以訪問 Only admin can access)
 */
router.post('/', authenticate, authorize(['admin']), userController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    更新用戶 Update user
 * @access  Private (只有管理員可以訪問 Only admin can access)
 */
router.put('/:id', authenticate, authorize(['admin']), userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    刪除用戶 Delete user
 * @access  Private (只有管理員可以訪問 Only admin can access)
 */
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

// 導出路由器 Export router
module.exports = router; 