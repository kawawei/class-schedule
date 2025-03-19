// 導入依賴 Import dependencies
const express = require('express');
const { authenticate } = require('../middleware/auth');

/**
 * 創建部門路由 Create department routes
 * @param {Object} models - 數據庫模型 Database models
 * @returns {Object} Router 實例 Router instance
 */
module.exports = (models) => {
  const router = express.Router();
  const { Department } = models;

  /**
   * 獲取所有部門 Get all departments
   * GET /api/departments
   * @private
   */
  router.get('/', authenticate, async (req, res) => {
    try {
      const departments = await Department.findAll({
        attributes: ['id', 'name', 'code', 'description', 'is_active']
      });

      res.json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('獲取部門列表失敗 Failed to get departments:', error);
      res.status(500).json({
        success: false,
        message: '獲取部門列表失敗 Failed to get departments'
      });
    }
  });

  /**
   * 獲取單個部門 Get single department
   * GET /api/departments/:id
   * @private
   */
  router.get('/:id', authenticate, async (req, res) => {
    try {
      const department = await Department.findByPk(req.params.id, {
        attributes: ['id', 'name', 'code', 'description', 'is_active']
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          message: '未找到部門 Department not found'
        });
      }

      res.json({
        success: true,
        data: department
      });
    } catch (error) {
      console.error('獲取部門失敗 Failed to get department:', error);
      res.status(500).json({
        success: false,
        message: '獲取部門失敗 Failed to get department'
      });
    }
  });

  /**
   * 更新部門 Update department
   * PUT /api/departments/:id
   * @private
   */
  router.put('/:id', authenticate, async (req, res) => {
    try {
      const { name, description, is_active } = req.body;
      const department = await Department.findByPk(req.params.id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: '未找到部門 Department not found'
        });
      }

      await department.update({
        name: name || department.name,
        description: description || department.description,
        is_active: is_active !== undefined ? is_active : department.is_active
      });

      res.json({
        success: true,
        message: '部門更新成功 Department updated successfully',
        data: {
          id: department.id,
          name: department.name,
          code: department.code,
          description: department.description,
          is_active: department.is_active
        }
      });
    } catch (error) {
      console.error('更新部門失敗 Failed to update department:', error);
      res.status(500).json({
        success: false,
        message: '更新部門失敗 Failed to update department'
      });
    }
  });

  return router;
}; 