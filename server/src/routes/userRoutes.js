const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// 所有路由都需要認證 All routes require authentication
router.use(authMiddleware);

// 獲取用戶列表 Get user list
router.get('/', userController.getAllUsers);

// 獲取單個用戶 Get single user
router.get('/:id', userController.getUser);

// 創建用戶 Create user
router.post('/', userController.createUser);

// 更新用戶 Update user
router.put('/:id', userController.updateUser);

// 刪除用戶 Delete user
router.delete('/:id', userController.deleteUser);

// 獲取用戶權限 Get user permissions
router.get('/:id/permissions', userController.getUserPermissions);

// 更新用戶權限 Update user permissions
router.put('/:id/permissions', userController.updateUserPermissions);

module.exports = router;

 