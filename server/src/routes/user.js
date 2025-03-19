// 導入依賴 Import dependencies
const express = require('express');
const { authenticate } = require('../middleware/auth');

/**
 * 創建用戶路由 Create user routes
 * @param {Object} models - 數據庫模型 Database models
 * @returns {Object} Router 實例 Router instance
 */
module.exports = (models) => {
  const router = express.Router();
  const { User, Department } = models;

  /**
   * 獲取所有用戶 Get all users
   * GET /api/users
   * @private
   */
  router.get('/', authenticate, async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'name', 'email', 'role', 'is_active'],
        include: [{
          model: Department,
          through: { attributes: [] },
          attributes: ['id', 'name', 'code']
        }]
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('獲取用戶列表失敗 Failed to get users:', error);
      res.status(500).json({
        success: false,
        message: '獲取用戶列表失敗 Failed to get users'
      });
    }
  });

  /**
   * 獲取單個用戶 Get single user
   * GET /api/users/:id
   * @private
   */
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'username', 'name', 'email', 'role', 'is_active'],
        include: [{
          model: Department,
          through: { attributes: [] },
          attributes: ['id', 'name', 'code']
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '未找到用戶 User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('獲取用戶失敗 Failed to get user:', error);
      res.status(500).json({
        success: false,
        message: '獲取用戶失敗 Failed to get user'
      });
    }
  });

  /**
   * 更新用戶 Update user
   * PUT /api/users/:id
   * @private
   */
  router.put('/:id', authenticate, async (req, res) => {
    try {
      const { name, email, role, is_active } = req.body;
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '未找到用戶 User not found'
        });
      }

      await user.update({
        name: name || user.name,
        email: email || user.email,
        role: role || user.role,
        is_active: is_active !== undefined ? is_active : user.is_active
      });

      res.json({
        success: true,
        message: '用戶更新成功 User updated successfully',
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: user.is_active
        }
      });
    } catch (error) {
      console.error('更新用戶失敗 Failed to update user:', error);
      res.status(500).json({
        success: false,
        message: '更新用戶失敗 Failed to update user'
      });
    }
  });

  /**
   * 刪除用戶 Delete user
   * DELETE /api/users/:id
   * @private
   */
  router.delete('/:id', authenticate, async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '未找到用戶 User not found'
        });
      }

      await user.destroy();

      res.json({
        success: true,
        message: '用戶刪除成功 User deleted successfully'
      });
    } catch (error) {
      console.error('刪除用戶失敗 Failed to delete user:', error);
      res.status(500).json({
        success: false,
        message: '刪除用戶失敗 Failed to delete user'
      });
    }
  });

  return router;
}; 